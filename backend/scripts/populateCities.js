import mongoose from "mongoose";
import City from "../models/City.js";
import dotenv from 'dotenv'

dotenv.config();

async function populateCities() {
    const cities = [
        { Name: "New York", rate: 1200 },
        { Name: "Los Angeles", rate: 950 },
        { Name: "Chicago", rate: 700 },
        { Name: "San Francisco", rate: 1500 },
        { Name: "Miami", rate: 800 },
        { Name: "Dallas", rate: 600 },
        { Name: "Seattle", rate: 1100 },
        { Name: "Houston", rate: 550 },
        { Name: "Boston", rate: 1300 },
        { Name: "Atlanta", rate: 650 },
        { Name: "Denver", rate: 750 },
        { Name: "Austin", rate: 700 },
        { Name: "Las Vegas", rate: 500 },
        { Name: "San Diego", rate: 1000 },
        { Name: "Phoenix", rate: 450 },
        { Name: "Philadelphia", rate: 850 },
        { Name: "Orlando", rate: 620 },
        { Name: "Portland", rate: 780 },
        { Name: "Detroit", rate: 400 },
        { Name: "Minneapolis", rate: 680 },
        { Name: "Nashville", rate: 740 },
        { Name: "Charlotte", rate: 720 },
        { Name: "San Antonio", rate: 580 },
        { Name: "Salt Lake City", rate: 670 },
        { Name: "New Orleans", rate: 620 },
        { Name: "Tampa", rate: 590 },
        { Name: "St. Louis", rate: 510 },
        { Name: "Kansas City", rate: 480 },
        { Name: "Columbus", rate: 520 },
        { Name: "Indianapolis", rate: 490 },
        { Name: "Cleveland", rate: 430 },
        { Name: "Pittsburgh", rate: 470 },
        { Name: "Baltimore", rate: 610 },
        { Name: "Raleigh", rate: 710 },
        { Name: "Sacramento", rate: 900 },
        { Name: "Jacksonville", rate: 570 },
        { Name: "Memphis", rate: 460 },
        { Name: "Milwaukee", rate: 540 },
        { Name: "Oklahoma City", rate: 430 },
        { Name: "Louisville", rate: 500 },
        { Name: "Albuquerque", rate: 420 },
        { Name: "Honolulu", rate: 1250 },
        { Name: "Anchorage", rate: 390 },
        { Name: "Buffalo", rate: 440 },
        { Name: "Boise", rate: 620 },
        { Name: "Des Moines", rate: 410 },
        { Name: "Richmond", rate: 530 },
        { Name: "Charleston", rate: 600 },
        { Name: "Fresno", rate: 480 },
        { Name: "El Paso", rate: 410 },
        { Name: "Birmingham", rate: 450 },
        { Name: "Madison", rate: 560 },
        { Name: "Greenville", rate: 590 },
        { Name: "Spokane", rate: 520 },
        { Name: "Reno", rate: 730 },
        { Name: "Chattanooga", rate: 470 },
        { Name: "Fort Worth", rate: 610 },
        { Name: "Toledo", rate: 420 },
        { Name: "Knoxville", rate: 460 },
        { Name: "Wichita", rate: 400 },
        { Name: "Augusta", rate: 410 },
        { Name: "Providence", rate: 680 },
        { Name: "Syracuse", rate: 450 },
        { Name: "Rochester", rate: 460 },
        { Name: "Tacoma", rate: 770 },
        { Name: "Lexington", rate: 500 },
        { Name: "Mobile", rate: 420 },
        { Name: "Lubbock", rate: 390 },
        { Name: "Montgomery", rate: 410 },
        { Name: "Savannah", rate: 590 },
        { Name: "Little Rock", rate: 430 },
        { Name: "Tulsa", rate: 480 },
        { Name: "Dayton", rate: 410 },
        { Name: "Columbia", rate: 450 },
        { Name: "Sioux Falls", rate: 420 },
        { Name: "Akron", rate: 410 },
        { Name: "Amarillo", rate: 390 }
    ];
    console.log(process.env.MONGO_URI);
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB connected successfully!");
    
    for(let i=0; i < cities.length; i++){
        const city = new City({
            Name: cities[i].Name,
            rate: cities[i].rate
        })
        await city.save();
        console.log(`City ${cities[i].Name} added`);
    }

} 


populateCities();