const mongoose = require('mongoose'),
    reqString = { type: String, required: true },
    reqBoolean = { type: Boolean, required: true, default: false },
    defBlank = {type: String, default: ''}
const passportLocalMongoose = require("passport-local-mongoose");

const userSchema = new mongoose.Schema({
    username: reqString,
    email: reqString,
    password: reqString,
    userId: reqString,
    doctor: {type:Boolean, default:false},
    pfp: {type:String, default:"https://www.nicepng.com/png/detail/933-9332131_profile-picture-default-png.png"},
    prescriptions: Array,
    appointments: Array,
    hospital: defBlank,
    hospitalLat: defBlank,
    hospitalLon: defBlank,
    patients: Array,
    consultationFee: Number,
    doctorBio: String,
    requests: Array,
    doctors: Array,
})
userSchema.plugin(passportLocalMongoose)

module.exports = mongoose.model("User", userSchema)