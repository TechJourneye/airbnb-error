const express=require("express");
const app= express();
const mongoose=require("mongoose");
const Listing=require("./models/listing.js");
const path=require("path");
const methodOverride=require("method-override");
const ejsMate=require("ejs-mate");
const WrapAsync=require("./utils/WrapAsync.js");
const ExpressError=require("./utils/ExpressError.js");
const {listingschema}=require("./schema.js");

app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.engine("ejs",ejsMate);
app.use(express.static(path.join(__dirname,"/public")));

const MONGO_url="mongodb://127.0.0.1:27017/wanderlust";

main().then(()=>{
    console.log("Connected to db");
}).catch((err)=>{
    console.log(err);
})
async function main(){
    await mongoose.connect(MONGO_url);
}

app.get("/",(req,res)=>{
    res.send("wanderlust working");
});

const validateListing=(req,res,next)=>{
    let {error}= listingschema.validate(req.body);
  
    if(error){
     throw new ExpressError(400,error);
    } else{
        next();
    }
}

//index route

app.get("/listing", WrapAsync(async (req,res)=>{
    
    const allListing = await Listing.find({});
    res.render("listing/index.ejs",{allListing});
}));

//new route
app.get("/listing/new",(req,res)=>{
    res.render("listing/new.ejs");
})

//show route
app.get("/listing/:id", WrapAsync(async (req,res)=>{
    let {id}=req.params;
    const listing= await Listing.findById(id);
    //console.log(listing);
    res.render("listing/show.ejs",{listing});
}));

//create route
app.post("/listing",WrapAsync(async(req,res)=>{
        let newListing=await new Listing(req.body.listing);
        newListing.save();
        res.redirect("/listing");  
        //next(err);
   }));

//Edit route
app.get("/listing/:id/edit", WrapAsync (async (req,res)=>{
    let {id}=req.params;
    const listing= await Listing.findById(id); 
    res.render("listing/edit.ejs",{listing});
}));

//update route
app.put("/listing/:id", WrapAsync(async(req,res)=>{
    let {id}=req.params;
    await Listing.findByIdAndUpdate(id,{...req.body.listing});
    res.redirect(`/listing/${id}`);
}));

//delete route
app.delete("/listing/:id", WrapAsync(async (req,res)=>{
    let {id}=req.params;
    await Listing.findByIdAndDelete(id);
    res.redirect("/listing");
}));

app.all("*",(err,req,res,next)=>{
    next(new ExpressError(404,"page not fount"));
})

app.use((err,req,res,next)=>{
    console.log(err);  
    let{status=400,message="some error occured"}=err;
    res.render("error.ejs",{err});
})

app.listen(8080,()=>{
    console.log("listening on port 8080");
});

