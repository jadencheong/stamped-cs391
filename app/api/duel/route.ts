// this file actually sends data somewhere after the duels
import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import dbConnect from '@/lib/db';
import User from '@/lib/models/User';
import Destination from '@/lib/models/Destination';
import Duel from '@/lib/models/Duel';
// i'll implemnt this later, placeholder for now
import { calculateEloChange } from '@/lib/elo';

export async function POST(req: Request) {
     

    // connect to the database
    await dbConnect();

    // oops, have to wrap it in a session so it becomes "all-or-nothing"
    // ie. I don't want a winner to get an update but not a loser, it must be both

    const session = await mongoose.startSession();
    session.startTransaction();

    try {

        // grab the results from the json request
        const { userId, winnerId, loserId, isDraw } = await req.json();

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
        // TODO: actually implement that lol
        const {gain, loss} = calculateEloChange(oldWinnerElo, oldLoserElo, isDraw);

        // now update the User's personal Elo rankings (have to ensure it's attomic)
            
        // update the winer
        await User.updateOne(
            {_id : userId, "myRankings.destinationId" :winnerId},
            // '$inc' increments the score rather than setting it to current total + gain, so if there's a race condition,
            // no data gets lost in that process
            { $inc: {"myRankings.$.personalElo": gain } },
            { session }
        );

            // update the loser 
            await User.updateOne(
                { _id: userId, "myRankings.destinationId": loserId },
                { $inc: { "myRankings.$.personalElo": loss } },
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