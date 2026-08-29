// Selected OECD countries
const countries = [
    "Australia",
    "Canada",
    "France",
    "Germany",
    "Italy",
    "Japan",
    "Korea",
    "New Zealand",
    "United Kingdom",
    "United States"
];

// Load Life Expectancy dataset
d3.csv("data/life_expectancy.csv").then(function(lifeData) {

    // Filter Life Expectancy data
    const filteredLife = lifeData.filter(function(d) {
        return countries.includes(d["Reference area"]) &&
               d["Age"] === "0 years" &&
               d["Sex"] === "Total" &&
               d["Measure"] === "Life expectancy" &&
               d["Frequency of observation"] === "Annual" &&
               +d["TIME_PERIOD"] >= 2015 &&
               +d["TIME_PERIOD"] <= 2024;
    });

    console.log("Life:", filteredLife.length);

    // Load Health Expenditure dataset
    d3.csv("data/health_expenditure.csv").then(function(healthData) {

        // Filter Health Expenditure data
        const filteredHealth = healthData.filter(function(d) {
            return countries.includes(d["Reference area"]) &&
                   d["Health function"] === "Total" &&
                   d["Unit of measure"] === "US dollars per person, PPP converted" &&
                   d["Financing scheme"] === "Total" &&
                   d["Price base"] === "Current prices" &&
                   d["Frequency of observation"] === "Annual" &&
                   +d["TIME_PERIOD"] >= 2015 &&
                   +d["TIME_PERIOD"] <= 2024;
        });

        console.log("Health:", filteredHealth.length);

        // Merge both datasets using Country + Year
        const mergedData = filteredLife.map(function(life) {

            const matchingHealth = filteredHealth.find(function(health) {
                return health["Reference area"] === life["Reference area"] &&
                       health["TIME_PERIOD"] === life["TIME_PERIOD"];
            });

            return {
                country: life["Reference area"],
                year: +life["TIME_PERIOD"],
                lifeExpectancy: +life["OBS_VALUE"],
                healthSpending: matchingHealth
                    ? +matchingHealth["OBS_VALUE"]
                    : null
            };
        });

        // Check merged data
        console.log("Merged:", mergedData.length);
        console.log(mergedData[0]);

    });

});