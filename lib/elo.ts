/**
 * winnerElo is the current elo of the winner
 * loserElo is the current elo of the loser
 * isDraw is whether the user thinks they're about equal 
 */


// ELO ALOGO "STOLEN" FROM
// https://mattmazzola.medium.com/implementing-the-elo-rating-system-a085f178e065

export function calculateEloChange(winnerElo: number, loserElo: number, isDraw: boolean) {
    const K = 100; // determines how fast ranks change

    // calculate the expected scores
    // based on probability that winner "should" win
    const expectedWinner = 1 / (1 + Math.pow(10, (loserElo - winnerElo) / 400));
    const expectedLoser = 1 - expectedWinner;

    // calculate the actual scores
    const scoreWinner = isDraw ? 0.5 : 1;
    const scoreLoser = isDraw ? 0.5 : 0;

    // calculate the swing (gain and loss from this duel)
    // expected winners only rise by a little, unexpected winners rise much more
    const gain = Math.round(K * (scoreWinner - expectedWinner));
    const loss = Math.round(K * (scoreLoser - expectedLoser));

    // actually return them lol 
    return { gain, loss };

}