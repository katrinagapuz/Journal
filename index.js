// INITIALIZE
var express 			= require("express"),
	app 				= express(),
	mongoose 			= require("mongoose"),
	bodyParser 			= require("body-parser"),
	methodOverride 		= require("method-override"),
	expressSanitizer 	= require("express-sanitizer");

// CONFIG
mongoose.connect("mongodb://localhost/journal_app", { useNewUrlParser: true, useFindAndModify: false });
app.use(bodyParser.urlencoded({extended: true}));
app.use(expressSanitizer());
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(methodOverride("_method"));

// MONGOOSE/MODEL CONFIG
var journalSchema = {
	title: String,
	image: String,
	body: String,
	create: {type: Date, default: Date.now}
};

var Journal = mongoose.model("journal", journalSchema);


// ROUTES

// LANDING PAGE
app.get("/", function(req, res){
	res.redirect("/journals");
});

// INDEX - LIST ALL JOURNALS
app.get("/journals", function(req, res){
	Journal.find({}, function(err, journals){
		if(err){
			console.log(err);
		} else{
			res.render("index", {journals: journals});	
		}
	});
});

// NEW - SHOW FORM FOR A NEW JOURNAL
app.get("/journals/new", function(req, res){
	res.render("new");
});

// CREATE - CREATES A NEW JOURNAL; REDIRECT TO INDEX
app.post("/journals", function(req, res){
	req.body.journal.body = req.sanitize(req.body.journal.body);
	Journal.create(req.body.journal, function(err, newJournal){
		if(err){
			console.log(err);
			res.redirect("/journals/new");
		} else{
			res.redirect("/journals");
		}
	});
});

// SHOW - SHOW ONE PARTICULAR JOURNAL AND ITS DETAILS
app.get("/journals/:id", function(req, res){
	Journal.findById(req.params.id, function(err, foundJournal){
		if(err){
			console.log(err);
			res.redirect("/journals");
		} else {
			res.render("show", {journal: foundJournal});
		}
	});
});

// EDIT - SHOW FORM TO EDIT A PARTICULAR JOURNAL
app.get("/journals/:id/edit", function(req,res){
	Journal.findById(req.params.id, function(err, foundJournal){
		if(err){
			console.log(err);
			res.redirect("/journals");
		} else{
			res.render("edit", {journal: foundJournal});
		}
	});
});

// UPDATE - UPDATE A PARTICULAR JOURNAL; REDIRECT TO SHOW PAGE
app.put("/journals/:id", function(req, res){
	req.body.journal.body = req.sanitize(req.body.journal.body);
	Journal.findByIdAndUpdate(req.params.id, req.body.journal, function(err, updatedJournal){
		if(err){
			console.log(err);
			res.redirect("/journals");
		} else{
			res.redirect("/journals/" + req.params.id);
		}
	})
});

// DESTROY - DELETES A PARTICULAR JOURNAL
app.delete("/journals/:id", function(req, res){
	Journal.findByIdAndRemove(req.params.id, function(err){
		if(err){
			console.log(err);
			res.redirect("/journals");
		} else{
			res.redirect("/journals");
		}
	});
});

// START SERVER
app.listen("8080", function(){
	console.log("JournalApp server started.")
});