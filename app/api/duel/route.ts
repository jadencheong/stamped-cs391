// this file actually sends data somewhere after the duels
import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import dbConnect from '@/lib/db';
import User from '@/lib/models/User';
import Destination from '@/lib/models/Destination';
import Duel from '@/lib/models/Duel';
// i'll implemnt this later, placeholder for now
import { calculateEloChange } from '@/lib/elo';

// created by Anna

/**
 * api/duel/route.ts
 * 
 * FILE OVERVIEW:
 * 
 * This API route handles the matchmaking logic (GET) and score processing (POST) 
 * for the destination duels. It supports three distinct matchmaking modes: 
 * Challenger (climbing the ladder), New Entry (initial placement), and 
 * Random (competitive neighbors). The POST handler uses MongoDB transactions 
 * to ensure atomicity when updating Elo ratings across multiple collections, so that 
 * Elos do not find thesmselves effect by race conditions. 
 */


export async function GET(req: NextRequest) {
    // connect to mongodb
    await dbConnect();

    

    // parsung query parameters from incoming url
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId'); 
    const challengerId = searchParams.get('challengerId'); 

    if (!userId || userId === 'null' || userId === 'undefined') {
        return NextResponse.json({ error: "Valid User ID required" }, { status: 400 });
    }

    try {
        // fetch the user, populate the rankings 
        const user = await User.findById(userId).populate('myRankings.destinationId');
        
        // ensure user exists and has enough cities to duel 
        if (!user || user.myRankings.length < 2) {
            return NextResponse.json({ error: "Add more posts!" }, { status: 400 });
        }

        
        const rankings = user.myRankings;

        // challenger gauntlet fro when a city is climbing the leaderboard 
        if (challengerId && challengerId !== 'undefined') {
            // refetch, filter for valid destinations
            const user = await User.findById(userId).populate('myRankings.destinationId');
            const rankings = user.myRankings.filter((r: any) => r.destinationId && r.destinationId._id);

            // sort by Elo to creater a "ladder" for challenger climbing 
            const sortedLadder = [...rankings].sort((a: any, b: any) => {
                if (a.personalElo !== b.personalElo) {
                    return a.personalElo - b.personalElo; 
                }
                // use ID string as tie breaker/precent infinite loops 
                return String(a.destinationId._id).localeCompare(String(b.destinationId._id));
            });

            // find current position of challener in sorted ladder
            const currentIndex = sortedLadder.findIndex((r: any) => 
                r.destinationId._id.toString() === challengerId
            );

            const challengerRank = sortedLadder[currentIndex];

            // if challenger is not at the top of the ladder, pick city above it as next comeponent 
            if (currentIndex < sortedLadder.length - 1) {
                const opponent = sortedLadder[currentIndex + 1];
                return NextResponse.json({ 
                    pair: [challengerRank.destinationId, opponent.destinationId],
                    isVictory: false // explicitly state we are still climbing
                });
            }
            // challanger aready at the top, return victory
            return NextResponse.json({ 
                pair: [
                    challengerRank.destinationId, 
                    sortedLadder[sortedLadder.length - 2]?.destinationId || challengerRank.destinationId
                ],
                isVictory: true 
            });
        }

        // fresh enter detection, trigger a gauntlet prompt if city never dueled 
        const freshEntry = rankings.find((r: any) => !r.timesDuelled || r.timesDuelled === 0);
        
        if (freshEntry) {
            // sort by elo to find weakest city 
            const sorted = [...rankings].sort((a: any, b: any) => a.personalElo - b.personalElo);
            // new entry fights city at bottom
            // handles edge case where it is the bottom 
            const opponent = sorted[0].destinationId._id.toString() === freshEntry.destinationId._id.toString() 
                ? sorted[1] 
                : sorted[0];

            return NextResponse.json({ 
        pair: [freshEntry.destinationId, opponent.destinationId],
        isNewChallenger: true // show new entry modals 
    });
        }

        // random duel mode 
        const sorted = [...rankings].sort((a: any, b: any) => a.personalElo - b.personalElo);
        
        // pcik random index (besides very last)
        const startIndex = Math.floor(Math.random() * (sorted.length - 1));
        
        // get 2 neighbors so duel is competitive 
        return NextResponse.json({ 
            pair: [sorted[startIndex].destinationId, sorted[startIndex + 1].destinationId] 
        });

    } catch (error) {
        console.error("GET Duel Error:", error);
        return NextResponse.json({ error: "Failed to fetch duel" }, { status: 500 });
    }
}



export async function POST(req: Request) {
     

    // connect to the database
    await dbConnect();

    // oops, have to wrap it in a session so it becomes "all-or-nothing"
    // ie. I don't want a winner to get an update but not a loser, it must be both

    const session = await mongoose.startSession();
    session.startTransaction();

    try {

        // grab the results from the json request
        const { userId, winnerId, loserId, isDraw, challengerId } = await req.json();

        if (!userId || userId === 'null' || userId === 'undefined') {
            return NextResponse.json({ error: "Valid User ID required" }, { status: 400 });
        }

        // get the current rating's from the active User's personal list
        const user = await User.findById(userId);
         // here, r is representing a single ranking entry. we ignore the type. we then trasnform the ObjectId for the destination of a string and ensure it matches the winnerId
        const winnerRank = user.myRankings.find((r: any) => r.destinationId.toString() === winnerId);
        // same with looser
        const loserRank = user.myRankings.find((r: any) => r.destinationId.toString() === loserId);


        // get the old Elo's (of the user)
        const oldWinnerElo = winnerRank?.personalElo || 1000;
        const oldLoserElo = loserRank?.personalElo || 1000;
            
        // now actually use the math
        let {gain, loss} = calculateEloChange(oldWinnerElo, oldLoserElo, isDraw);


        if (challengerId && winnerId === challengerId && gain <= 0 && !isDraw) {
            gain = 2; 
            loss = -2;
        }

        // now update the User's personal Elo rankings (have to ensure it's attomic)
            
        // update the winer
        await User.updateOne(
            {_id : userId, "myRankings.destinationId" :winnerId},
            // '$inc' increments the score rather than setting it to current total + gain, so if there's a race condition,
            // no data gets lost in that process
            { 
                $inc: { 
                    "myRankings.$.personalElo": gain,
                    "myRankings.$.timesDuelled": 1
                } 
            },
            { session }
        );

            // update the loser 
            await User.updateOne(
                { _id: userId, "myRankings.destinationId": loserId },
                    {
                        $inc: { 
                        "myRankings.$.personalElo": loss,
                        "myRankings.$.timesDuelled": 1 
                    }
                },
                { session }
            );

            // update global rankings/stats
            await Destination.findByIdAndUpdate(
                winnerId, 
                { $inc: { globalTotalScore: gain, timesDuelled: 1 } },
                { session }
            );

            // log the duel history as a duel
            await Duel.create([{
                userId,
                winnerId,
                loserId,
                isDraw,
                eloGain: gain,
                eloLoss: loss
            }], { session });

            // if everything worked, save it all and commit!
            await session.commitTransaction();

            // server says "i'm done, here's the data you asked for!" and sends it off
            return NextResponse.json({ success: true, gain, loss });

        }
    
        catch (error) {
            // if anything failed, abort the whole transaction to make sure there isn't part of it that goes through
            await session.abortTransaction();
            console.error("Duel Transaction Error:", error);
            return NextResponse.json({ error: "Transaction failed, data reverted." }, { status: 500 });

        } finally {
            // close the session
            // for teammates: important because an open session consumes RAM, and if we never closed any sessions from duels, it would eventually become A LOT of RAM
            session.endSession();
        }



}