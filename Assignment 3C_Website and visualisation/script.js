
    // COS30045 Assignment 3 - Team 1E
    // OECD Healthcare Spending and Life Expectancy

    const countries = [
        "Australia", "Canada", "France", "Germany", "Italy",
        "Japan", "Korea", "New Zealand", "United Kingdom", "United States"
    ];


    // ==============================
    // LOAD AND PREPARE DATA
    // ==============================

    Promise.all([
        d3.csv("data/life_expectancy.csv"),
        d3.csv("data/health_expenditure.csv")
    ]).then(function([lifeData, healthData]) {

        // Filter life expectancy data
        const filteredLife = lifeData.filter(d =>
            countries.includes(d["Reference area"]) &&
            d["Age"] === "0 years" &&
            d["Sex"] === "Total" &&
            d["Measure"] === "Life expectancy" &&
            d["Frequency of observation"] === "Annual" &&
            +d["TIME_PERIOD"] >= 2015 &&
            +d["TIME_PERIOD"] <= 2024
        );

        // Filter healthcare expenditure data
        const filteredHealth = healthData.filter(d =>
            countries.includes(d["Reference area"]) &&
            d["Health function"] === "Total" &&
            d["Unit of measure"] === "US dollars per person, PPP converted" &&
            d["Financing scheme"] === "Total" &&
            d["Price base"] === "Current prices" &&
            d["Frequency of observation"] === "Annual" &&
            +d["TIME_PERIOD"] >= 2015 &&
            +d["TIME_PERIOD"] <= 2024
        );

        // Merge datasets using country + year
        const mergedData = filteredLife.map(life => {

            const health = filteredHealth.find(h =>
                h["Reference area"] === life["Reference area"] &&
                h["TIME_PERIOD"] === life["TIME_PERIOD"]
            );

            return {
                country: life["Reference area"],
                year: +life["TIME_PERIOD"],
                lifeExpectancy: +life["OBS_VALUE"],
                healthSpending: health ? +health["OBS_VALUE"] : null
            };
        });

        console.log("Merged Data:", mergedData);


        // Same colours for countries in all charts
        const colourScale = d3.scaleOrdinal()
            .domain(countries)
            .range(d3.schemeTableau10);


        // ==================================================
        // VISUALISATION 1
        // HEALTHCARE SPENDING VS LIFE EXPECTANCY
        // ==================================================

        const scatterData = countries.map(country =>
            mergedData
                .filter(d =>
                    d.country === country &&
                    d.healthSpending !== null &&
                    !isNaN(d.healthSpending) &&
                    !isNaN(d.lifeExpectancy)
                )
                .sort((a, b) => b.year - a.year)[0]
        ).filter(d => d);


        const margin1 = { top: 40, right: 65, bottom: 80, left: 90 };
        const width1 = 900;
        const height1 = 520;

        const innerWidth1 = width1 - margin1.left - margin1.right;
        const innerHeight1 = height1 - margin1.top - margin1.bottom;


        const svg1 = d3.select("#visual-1")
            .append("svg")
            .attr("viewBox", `0 0 ${width1} ${height1}`)
            .attr("width", "100%");


        const chart1 = svg1.append("g")
            .attr("transform", `translate(${margin1.left},${margin1.top})`);


        const x1 = d3.scaleLinear()
            .domain([0, d3.max(scatterData, d => d.healthSpending) * 1.1])
            .range([0, innerWidth1]);


        const lifeExtent = d3.extent(scatterData, d => d.lifeExpectancy);

        const y1 = d3.scaleLinear()
            .domain([lifeExtent[0] - 1, lifeExtent[1] + 1])
            .range([innerHeight1, 0]);


        // Axes
        chart1.append("g")
            .attr("transform", `translate(0,${innerHeight1})`)
            .call(
                d3.axisBottom(x1)
                    .ticks(6)
                    .tickFormat(d => "$" + d3.format(",")(d))
            );

        chart1.append("g")
            .call(d3.axisLeft(y1).ticks(6));


        // Axis labels
        chart1.append("text")
            .attr("x", innerWidth1 / 2)
            .attr("y", innerHeight1 + 60)
            .attr("text-anchor", "middle")
            .attr("class", "axis-label")
            .text("Healthcare Expenditure per Person (USD, PPP)");

        chart1.append("text")
            .attr("transform", "rotate(-90)")
            .attr("x", -innerHeight1 / 2)
            .attr("y", -65)
            .attr("text-anchor", "middle")
            .attr("class", "axis-label")
            .text("Life Expectancy (Years)");


        // Dots
        chart1.selectAll(".scatter-dot")
            .data(scatterData)
            .enter()
            .append("circle")
            .attr("class", "scatter-dot")
            .attr("cx", d => x1(d.healthSpending))
            .attr("cy", d => y1(d.lifeExpectancy))
            .attr("r", 7);


        // Country label offsets for better readability
        const labelOffsets = {
            "Australia": [10, -10],
            "Canada": [10, 16],
            "France": [10, -18],
            "Germany": [10, 18],
            "Italy": [10, -10],
            "Japan": [10, -12],
            "Korea": [10, 18],
            "New Zealand": [10, -12],
            "United Kingdom": [10, 18],
            "United States": [-12, -12]
        };


        // Country labels
        chart1.selectAll(".country-label")
            .data(scatterData)
            .enter()
            .append("text")
            .attr("class", "country-label")
            .attr("x", d =>
                x1(d.healthSpending) + labelOffsets[d.country][0]
            )
            .attr("y", d =>
                y1(d.lifeExpectancy) + labelOffsets[d.country][1]
            )
            .attr("text-anchor", d =>
                d.country === "United States" ? "end" : "start"
            )
            .text(d => d.country);


        // Chart note
        svg1.append("text")
            .attr("x", width1 - 40)
            .attr("y", 25)
            .attr("text-anchor", "end")
            .attr("class", "chart-note")
            .text("Latest available year for each country");



        // ==================================================
        // VISUALISATION 2
        // HEALTHCARE SPENDING OVER TIME
        // ==================================================

        const spendingData = mergedData.filter(d =>
            d.healthSpending !== null &&
            !isNaN(d.healthSpending)
        );


        const margin2 = { top: 30, right: 170, bottom: 80, left: 100 };
        const width2 = 1000;
        const height2 = 550;

        const innerWidth2 = width2 - margin2.left - margin2.right;
        const innerHeight2 = height2 - margin2.top - margin2.bottom;


        const svg2 = d3.select("#visual-2")
            .append("svg")
            .attr("viewBox", `0 0 ${width2} ${height2}`)
            .attr("width", "100%");


        const chart2 = svg2.append("g")
            .attr("transform", `translate(${margin2.left},${margin2.top})`);


        const x2 = d3.scaleLinear()
            .domain([2015, 2024])
            .range([0, innerWidth2]);


        const y2 = d3.scaleLinear()
            .domain([0, d3.max(spendingData, d => d.healthSpending) * 1.1])
            .range([innerHeight2, 0]);


        // Axes
        chart2.append("g")
            .attr("transform", `translate(0,${innerHeight2})`)
            .call(
                d3.axisBottom(x2)
                    .tickValues(d3.range(2015, 2025))
                    .tickFormat(d3.format("d"))
            );

        chart2.append("g")
            .call(
                d3.axisLeft(y2)
                    .ticks(6)
                    .tickFormat(d => "$" + d3.format(",")(d))
            );


        // Axis labels
        chart2.append("text")
            .attr("x", innerWidth2 / 2)
            .attr("y", innerHeight2 + 60)
            .attr("text-anchor", "middle")
            .attr("class", "axis-label")
            .text("Year");

        chart2.append("text")
            .attr("transform", "rotate(-90)")
            .attr("x", -innerHeight2 / 2)
            .attr("y", -75)
            .attr("text-anchor", "middle")
            .attr("class", "axis-label")
            .text("Healthcare Expenditure per Person (USD, PPP)");


        // Group by country
        const spendingByCountry = d3.group(spendingData, d => d.country);

        const spendingLine = d3.line()
            .x(d => x2(d.year))
            .y(d => y2(d.healthSpending));


        spendingByCountry.forEach(function(values, country) {

            values.sort((a, b) => a.year - b.year);

            chart2.append("path")
                .datum(values)
                .attr("class", "spending-line")
                .attr("fill", "none")
                .attr("stroke", colourScale(country))
                .attr("stroke-width", 2.5)
                .attr("d", spendingLine);

            chart2.selectAll(null)
                .data(values)
                .enter()
                .append("circle")
                .attr("cx", d => x2(d.year))
                .attr("cy", d => y2(d.healthSpending))
                .attr("r", 3)
                .attr("fill", colourScale(country));
        });


        // Legend
        const legend2 = svg2.append("g")
            .attr("transform", `translate(${width2 - 155},40)`);

        countries.forEach(function(country, i) {

            legend2.append("circle")
                .attr("cx", 0)
                .attr("cy", i * 34)
                .attr("r", 5)
                .attr("fill", colourScale(country));

            legend2.append("text")
                .attr("x", 12)
                .attr("y", i * 34 + 4)
                .attr("class", "legend-text")
                .text(country);
        });



        // ==================================================
        // VISUALISATION 3
        // LIFE EXPECTANCY OVER TIME
        // ==================================================

        const lifeTrendData = mergedData.filter(d =>
            !isNaN(d.lifeExpectancy)
        );


        const margin3 = { top: 30, right: 170, bottom: 80, left: 90 };
        const width3 = 1000;
        const height3 = 550;

        const innerWidth3 = width3 - margin3.left - margin3.right;
        const innerHeight3 = height3 - margin3.top - margin3.bottom;


        const svg3 = d3.select("#visual-3")
            .append("svg")
            .attr("viewBox", `0 0 ${width3} ${height3}`)
            .attr("width", "100%");


        const chart3 = svg3.append("g")
            .attr("transform", `translate(${margin3.left},${margin3.top})`);


        const x3 = d3.scaleLinear()
            .domain([2015, 2024])
            .range([0, innerWidth3]);


        const lifeTrendExtent = d3.extent(
            lifeTrendData,
            d => d.lifeExpectancy
        );


        const y3 = d3.scaleLinear()
            .domain([
                Math.floor(lifeTrendExtent[0]) - 1,
                Math.ceil(lifeTrendExtent[1]) + 1
            ])
            .range([innerHeight3, 0]);


        // Axes
        chart3.append("g")
            .attr("transform", `translate(0,${innerHeight3})`)
            .call(
                d3.axisBottom(x3)
                    .tickValues(d3.range(2015, 2025))
                    .tickFormat(d3.format("d"))
            );

        chart3.append("g")
            .call(d3.axisLeft(y3).ticks(7));


        // Axis labels
        chart3.append("text")
            .attr("x", innerWidth3 / 2)
            .attr("y", innerHeight3 + 60)
            .attr("text-anchor", "middle")
            .attr("class", "axis-label")
            .text("Year");

        chart3.append("text")
            .attr("transform", "rotate(-90)")
            .attr("x", -innerHeight3 / 2)
            .attr("y", -60)
            .attr("text-anchor", "middle")
            .attr("class", "axis-label")
            .text("Life Expectancy (Years)");


        // Group by country
        const lifeByCountry = d3.group(
            lifeTrendData,
            d => d.country
        );


        const lifeLine = d3.line()
            .x(d => x3(d.year))
            .y(d => y3(d.lifeExpectancy));


        // Draw lines and points
        lifeByCountry.forEach(function(values, country) {

            values.sort((a, b) => a.year - b.year);

            chart3.append("path")
                .datum(values)
                .attr("class", "life-line")
                .attr("fill", "none")
                .attr("stroke", colourScale(country))
                .attr("stroke-width", 2.5)
                .attr("d", lifeLine);

            chart3.selectAll(null)
                .data(values)
                .enter()
                .append("circle")
                .attr("cx", d => x3(d.year))
                .attr("cy", d => y3(d.lifeExpectancy))
                .attr("r", 3)
                .attr("fill", colourScale(country));
        });


        // Legend
        const legend3 = svg3.append("g")
            .attr("transform", `translate(${width3 - 155},40)`);

        countries.forEach(function(country, i) {

            legend3.append("circle")
                .attr("cx", 0)
                .attr("cy", i * 34)
                .attr("r", 5)
                .attr("fill", colourScale(country));

            legend3.append("text")
                .attr("x", 12)
                .attr("y", i * 34 + 4)
                .attr("class", "legend-text")
                .text(country);
        });


    }).catch(function(error) {

        console.error("Error loading OECD datasets:", error);

    });