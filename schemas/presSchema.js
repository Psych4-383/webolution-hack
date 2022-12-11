const mongoose = require('mongoose'),
    reqString = { type: String, required: true },
    reqBoolean = { type: Boolean, required: true, default: false },
    defBlank = {type: String, default: ''},
    moment = require('moment'),
    now = new Date(),
    dateStringWithTime = moment(now).format('DD-MM-YYYY');

const presSchema = new mongoose.Schema({
    presId: reqString,
    patient: reqString,
    patientName: reqString,
    doctor: reqString,
    doctorName: reqString,
    hospital: String,
    drug: reqString,
    dose: String,
    perDay: Number,
    days: Number,
    specIns: String,
    presDate: {
        type: String,
        default: dateStringWithTime
    }
})

module.exports = mongoose.model("Prescription", presSchema)