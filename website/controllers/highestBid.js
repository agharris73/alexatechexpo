var express = require('express');
var router = express.Router();

router.post('/', function(req, res) {
  //user = req.user.id
  //text = req.body.text
  console.log('highestBid POST hit');
  //Comment.create(user, text, function (err, comment) {
    res.redirect('/')
  //})
})

router.get('/:id', function(req, res) {
  res.send("highestBid GET hit");
})

module.exports = router;