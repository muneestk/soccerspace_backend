import mongoose from "mongoose";
const schema = mongoose.Schema;

const scorerSchema = mongoose.Schema({
  scorerName: {
    type: String,
  },
  count: {
    type: Number,
    default: 1,
  },
  matchId: {
    type: schema.Types.ObjectId,
    required: true,
  },
  tournamentId: {
    type: schema.Types.ObjectId,
    ref: 'tournament',
    required: true,
  },
  teamId: {
    type: schema.Types.ObjectId,
    ref: 'team',
    required: true,
  },
  team: {
    type: String,
    required: true,
  },
});

const scorerModel = mongoose.model('score', scorerSchema);
export default scorerModel;
