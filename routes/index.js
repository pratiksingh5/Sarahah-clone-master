var express = require('express');
var router = express.Router();
var User = require('./users');
var passport = require('passport');
var passportLocal = require('passport-local');
var Message = require('./messages')

var multer = require('multer');

var fs = require('fs-extra');



var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/images/uploads')
  },
  filename: function (req, file, cb) {
    cb(null,  + Date.now()+file.originalname);
  }
})
 
var upload = multer({ storage: storage }).single('prflimage')


passport.use(new passportLocal(User.authenticate()));

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Srahahah' });
});

router.get('/register', function(req,res,next){
  res.render('register')
})

router.get('/checkusername/:username', function(req, res, next){
  User.findOne({username: req.params.username})
      .then(function(u){
        if(!u){
          res.send(true);
        }
        else{
          res.send(false);
        }
      })
});

router.post('/register', function(req,res,next){
  var newUser = new User({
    username: req.body.username,
    email: req.body.email,
    name: req.body.name,
    gender: req.body.gender,
    about: req.body.about,
    relationshipStatus: req.body.relationshipStatus
  })
  User.register(newUser, req.body.password)
  .then(function(u){
    Message.create({
      messages: 'welcome',
      username: req.body.username
    })
        
    res.redirect('/messages');
    console.log('yes its working');
})
  .catch(function(e){
    res.send(e);
  })
});

router.post('/login', passport.authenticate('local', {
  successRedirect: '/messages',
  failureRedirect: '/'
}), function(req,res,next){});

router.get('/messages', isLoggedIn,function(req, res, next){
  var allmessages;
  Message.find({username: req.session.passport.user})
  .then(function(msgs){
    allmessages = msgs.filter(msg=>{
       if( msg.username === req.session.passport.user){
        return msg.messages;
      } 
    })
    console.log(allmessages)
    var userLoggedIn = req.session.passport.user;
      res.render('messages', {loggedIn: userLoggedIn, messages: allmessages})
      
  })
  .catch(function(e){
    res.send(e);
  })
 
 
});

router.get('/message', isLoggedIn,function(req, res, next){
  res.render('message');
});

router.post('/messages/:user', function(req, res, next){
 

    Message.create({
      messages: req.body.message,
      username: req.params.user
    })
    .then((u)=>{
      User.findOne({username: req.params.user})
      .then((user)=>{
        if(!user){
          res.end()
        }
        else{
          user.messages.push(u.messages)
        }
        user.markModified('messages')
        user.save();
        
      })
    })
    
    console.log('<h3>message will be sent soon !</h3>');
    // res.end();
    res.send('hello')
  });

router.get('/sent', isLoggedIn,function(req, res, next){
  res.send('soon you will see your all messages !');
})

router.post('/upload',function(req,res,next){
  upload(req,res,function(err){
    if(err){
      console.log(err)
    }
    else{
      

      if(req.file === undefined) res.send(' 😒 ')
      else{
        var imgurl = './images/uploads/'+req.file.filename;
        User.findOne({username: req.session.passport.user})
      .then((u)=>{
      

        var oldPicAddress = u.profilePic;
        if(oldPicAddress != './images/def.jpg'){
          var dot = oldPicAddress.substring(0,1)
          var rest = oldPicAddress.substring(1,oldPicAddress.length)
          oldPicAddress = dot+'/public'+rest;
          fs.remove(oldPicAddress)
          .then(function(){
            u.profilePic = imgurl;
          u.save();
          res.redirect('/profile')
          })
          .catch((err)=>{
            u.profilePic = imgurl;
            u.save();
            res.redirect('/profile')
          })
        }
        else{

          u.profilePic = imgurl;
          u.save();
          res.redirect('/profile')

        }

       
        
        
      })

      }
      
    }
  })
})

router.get('/profile', isLoggedIn,function(req,res,next){


  User.findOne({username: req.session.passport.user})
  .then((user)=>{
    if(!user){
      req.logout();
      res.redirect('/')
    }
    else{
      res.render('profile',user);
    }
  })

});

router.get('/logout', function(req, res, next){
  req.logout();
  res.redirect('/');
});

function isLoggedIn(req, res, next){
  if(req.isAuthenticated()){
    return next();
  }
  else{
    res.redirect('/');
  }
}

router.get('/findimageadd',(req,res,next)=>{
  User.findOne({username: req.session.passport.user})
  .then((u)=>{
    res.send(u.profilePic);
  })
})


module.exports = router;
