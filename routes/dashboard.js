const router = require('express').Router();
const mongoose = require('mongoose')
const url = require('url');
const User = require('../schemas/userSchema.js')
const {ensureAuth} = require('../middleware/authenticate.js');
const { query } = require('express');

router.get('/home', ensureAuth, async (req, res)=> {
    var users = await User.find()
    res.render('dashboard/home', {title: 'Dashboard | Home', user:req.user, users})
})

router.get('/find-hospitals', (req, res)=> {
    res.render('dashboard/findhospitals', {title: 'Find Hospitals', user:req.user})
})

router.get('/editlocation', ensureAuth, async (req, res)=> {
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

router.get('/accept', ensureAuth, async (req, res)=> {
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

module.exports = router