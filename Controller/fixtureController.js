import jwt from "jsonwebtoken";
import fixtureModel from "../Modals/fixtureModel.js";
import teamModel from "../Modals/teamModel.js";
import scorerModel from "../Modals/teamScorer.js";



//----------FIXTURE FETCHING ------------//

export const fixtureFetching = async(req,res,next) => {
    try {
      
      const {id} = req.query
      const fixtureData = await fixtureModel.find({ tournamentId: id})
      .populate('matches.team1Id')
      .populate('matches.team2Id')
      .populate('tournamentId')
      
  
      if(fixtureData){
        return res.status(200).json({
           fixtureData
        })
      }else{
        return res.status(400).json({
          message:"something went wrong"
        })
      }
       
    } catch (error) {
      next(error)
      console.log(error.message);
    }
  }


  
//---------- SCORE UPDATE ------------//

export const scoreUpdate = async (req, res, next) => {
  try {

    const {form,team}=req.body
    const {team1score,team2score,tournamentId,matchId,winner}= form

    const updateResult = await fixtureModel.findOneAndUpdate({tournamentId:tournamentId,
      matches:{
        $elemMatch:{
          _id:matchId
        }
      }    
    },{
      $set:{
       "matches.$.team1Score":team1score,
       "matches.$.team2Score":team2score,
       "matches.$.winner":winner,
       "matches.$.matchStatus":"updated",    
      }
    })

    if (updateResult) {

      for (const scorer of team) {
        if (updateResult.matches[0].team1Id == scorer.teamId) {

          const existName = await scorerModel.findOneAndUpdate(
            { scorerName: scorer.scorername,matchId:matchId,team:"team1" },
            { $inc: { count : 1 } }
          );

          if(!existName){
            const scoreData = new scorerModel({
                scorerName:scorer.scorername,
                matchId,
                team:"team1"
            })
            const scoreDataSave = await scoreData.save()

           if (scoreDataSave) {
              await fixtureModel.findOneAndUpdate(
                {
                  tournamentId: tournamentId,
                  "matches._id": matchId
                },
                {
                  $addToSet: {
                    "matches.$.team1GoalScorers": scoreDataSave._id
                  }
                }
              );
            }

          }
        }else{
          const existName = await scorerModel.findOneAndUpdate(
            { scorerName: scorer.scorername,matchId:matchId,team:"team2" },
            { $inc: { count : 1 } }
          );

          if(!existName){
            const scoreData = new scorerModel({
                scorerName:scorer.scorername,
                matchId,
                team:"team2"

            })
            const scoreDataSave = await scoreData.save()

           if (scoreDataSave) {
              await fixtureModel.findOneAndUpdate(
                {
                  tournamentId: tournamentId,
                  "matches._id": matchId
                },
                {
                  $addToSet: {
                    "matches.$.team2GoalScorers": scoreDataSave._id
                  }
                }
              );
            }

          }
        }
      }
      
      res.status(200).json(updateResult);
    } else {
      res.status(400).json({
        message: "something went wrong",
      });
    }
  } catch (error) {
    next(error);
    console.log(error.message);
  }
};
  
//---------- ROUND UPDATE ------------//

export const roundUpdate = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
const claim = jwt.verify(token, process.env.MANAGERSECRETKEY);
const managerId = claim._id;

const { round, tournamentId } = req.body;
const roundUpdate = round - 1;

try {
  const checkFixtureData = await fixtureModel.findOne({
    tournamentId: tournamentId,
    matchRound: roundUpdate,
  });
  if (checkFixtureData) {
    return res.status(400).json({
      message: "Already updated fixture",
    });
  }

  


  const fixtureData = await fixtureModel.findOne({
    tournamentId: tournamentId,
    matchRound: round,
  });

  let winners = [];
  fixtureData.matches.forEach((element) => {
    winners.push(element.winner);
  });

  var matches = [];
  for (let i = 0; i < winners.length; i += 2) {
    const match = {
      team1Id: winners[i]._id,
      team2Id: winners[i + 1]._id,
    };
    matches.push(match);
  }

  const updateFixture = new fixtureModel({
    tournamentId: tournamentId,
    managerId: managerId,
    matchRound: roundUpdate,
    matches: matches,
  });

  const updateResult = await updateFixture.save();

  if (updateResult) {
    
  await fixtureModel.updateMany(
    {
      tournamentId: tournamentId,
      matchRound: round,
    },
    {
      $set: {
        "matches.$[].matchStatus": "completed",
      },
    }
  );

    res.status(200).json(updateResult);
  } else {
    res.status(400).json({
      message: "Something went wrong",
    });
  }
} catch (error) {
  next(error);
  console.error(error.message);
}
}