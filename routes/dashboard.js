const router = require('express').Router();
const url = require('url');
const { query } = require('express');
const { uuid } = require('uuidv4')
const {ensureAuth, ensureDoc} = require('../middleware/authenticate.js');
const mongoose = require('mongoose')
const User = require('../schemas/userSchema.js')
const Prescription = require('../schemas/presSchema.js')
const htmlpdfnode = require('html-pdf-node')
const ejs = require('ejs')

router.get('/home', ensureAuth, async (req, res)=> {
    var prescriptions = [];
    if(req.user.doctor){
        const prescs = await Prescription.find({doctor: req.user.userId})
        prescs.forEach(presc => {
            prescriptions.push([presc.patientName, presc.drug, presc.presId])
        });
    } else {
        const prescs = await Prescription.find({patient: req.user.userId})
        prescs.forEach(presc=>{
            prescriptions.push([presc.doctorName, presc.drug, presc.presId])
        })
    }
    var users = await User.find()
    res.render('dashboard/home', {title: 'Dashboard | Home', user:req.user, users, prescriptions})
})

router.get('/find-hospitals', (req, res)=> {
    res.render('dashboard/findhospitals', {title: 'Find Hospitals', user:req.user})
})

router.get('/editlocation', ensureDoc, async (req, res)=> {
    console.log(req.user.name)
    const queryobj = url.parse(req.url, true).query
    console.log(queryobj)
    User.findOne({username: req.user.username,userId: req.user.userId})
    .then((doc)=>{
        console.log(req.user.username, queryobj.location, queryobj.lat, queryobj.lon, queryobj.fullLoc)
        doc.username = req.user.username
        doc.hospital = queryobj.location
        doc.hospitalLat = queryobj.lat
        doc.hospitalLon = queryobj.lon
        doc.doctorBio = queryobj.fullLoc
        doc.save()
        .then(()=>{res.redirect('/dashboard/home')})
    })
})

router.get('/find-doctors', ensureAuth, async (req, res)=> {
    const queryobj = url.parse(req.url, true).query
    if(queryobj.lat){
        User.find({doctor:true, hospitalLat: queryobj.lat, hospitalLon: queryobj.lon})
        .then((users)=> {
            res.render('dashboard/find-doctors', {title: "Find Doctors", doctors: users, user: req.user, hospital: queryobj.hospital})
        })
    } else {
        User.find({doctor:true})
        .then((users)=> {
            res.render('dashboard/find-doctors', {title: "Find Doctors", doctors: users, user: req.user, hospital: undefined})
        })
    }
})

router.get('/request', ensureAuth, async (req, res)=> {
    const queryobj = url.parse(req.url, true).query
    const docid = queryobj.id 
    User.findOne({userId: docid})
    .then((doc)=>{
        doc.requests.push(req.user.userId)
        doc.save().then(res.redirect('/dashboard/home'))
    })
})

router.get('/accept', ensureDoc, async (req, res)=> {
    const queryobj = url.parse(req.url, true).query
    const id = queryobj.id
    const docid = req.user.userId
    console.log(docid)
    User.findOne({userId: docid})
    .then((user)=>{
        var idind = user.requests.indexOf(id)
        user.requests.splice(idind, 1)
        if(!user.patients.includes(id)){
            user.patients.push(id)
        }
        user.save().then(()=>{
            User.findOne({userId: id})
            .then ((patient)=>{
                patient.doctors.push(docid)
                patient.save()
                .then(()=>{
                    res.redirect('/dashboard/home')
                })
            })
        })
    })
})

router.get('/new-prescription', ensureDoc, async (req, res)=> {
    const queryobj = url.parse(req.url, true).query
    const patientId = queryobj.id
    const patient = await User.findOne({userId: patientId})
    res.render('dashboard/new-prescription', {title: 'New Prescription', user: req.user, patient})
})

router.post('/new-prescription', ensureDoc, async (req, res)=> {
    const presId = uuid()
    const prescription = new Prescription({
        presId: presId,
        patient: req.body.patient_id,
        patientName: req.body.patient_name,
        doctor: req.body.doctor_id,
        doctorName: req.body.doctor_name,
        drug: req.body.drug
    })
    if(req.body.hospital){prescription.hospital=req.body.hospital}
    if(req.body.dose){prescription.dose=req.body.dose}
    if(req.body.per_day){prescription.perDay=req.body.per_day}
    if(req.body.days){prescription.days=req.body.days}
    if(req.body.spec_ins){prescription.specIns=req.body.spec_ins}
    prescription.save()
    .then((prescription)=>{
        console.log('logging prescription',prescription)
        User.findOne({userId: req.body.patient_id})
        .then((patient)=>{
            patient.prescriptions.push(presId)
            console.log('logging presc list',patient.prescriptions)
            patient.save()
            .then(()=>{
                User.findOne({userId: req.body.doctor_id})
                .then((doctor)=>{
                    doctor.assignedPrescriptions.push(presId)
                    doctor.save()
                    .then(()=>{
                        res.redirect('/dashboard/home')
                    })
                })
            })
        })
    })
})

router.get('/view-prescription', ensureAuth, async (req, res)=>{
    const queryobj = url.parse(req.url, true).query
    const presId = queryobj.id
    Prescription.findOne({presId: presId})
    .then((pres)=>{
        if(pres.patient===req.user.userId || pres.doctor===req.user.userId){
            res.render('dashboard/view-prescription', {title: "View Prescription", user: req.user, pres: pres})
        } else {    
            res.redirect('/auth/login')
        }
    })
})

router.get('/print', ensureAuth, async (req, res)=>{
    const queryobj = url.parse(req.url, true).query
    const presId = queryobj.id
    Prescription.findOne({presId: presId})
    .then((pres)=>{
        if(pres.patient===req.user.userId || pres.doctor===req.user.userId){
            ejs.renderFile('views/dashboard/presprint.ejs', {title: "View Prescription", user: req.user, pres: pres}).then(async (html) => {
                await htmlpdfnode.generatePdf({content: html}, {format: 'A5', landscape: false}).then(pdfBuffer => {
                    res.contentType("application/pdf");
                    res.send(pdfBuffer);
                });
            })
        } else {    
            res.redirect('/auth/login')
        }
    })
})

module.exports = router