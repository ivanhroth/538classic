document.addEventListener("DOMContentLoaded", ()=> {
    const stateNameList = ['Wyoming','Wisconsin','West Virginia','Washington',
    'Virginia','Vermont','Utah','Texas','Tennessee','South Dakota','South Carolina','Rhode Island',
    'Pennsylvania','Oregon','Oklahoma','Ohio','North Dakota','North Carolina','New York','New Mexico','New Jersey',
    'New Hampshire','Nevada','Nebraska','NE-3','NE-2','NE-1','Montana','Missouri','Mississippi','Minnesota',
    'Michigan','Massachusetts','Maryland','Maine','ME-2','ME-1','Louisiana','Kentucky','Kansas','Iowa','Indiana',
    'Illinois','Idaho','Hawaii','Georgia','Florida','District of Columbia','Delaware','Connecticut','Colorado',
    'California','Arkansas','Arizona','Alaska','Alabama'];
    const stateAbbrs = [ 'WY','WI','WV','WA','VA','VT','UT','TX','TN','SD','SC','RI','PA','OR','OK',
    'OH','ND','NC','NY','NM','NJ','NH','NV','NE','NE-3','NE-2','NE-1','MT','MO','MS','MN','MI','MA','MD',
    'ME','ME-2','ME-1','LA','KY','KS','IA','IN','IL','ID','HI','GA','FL','DC','DE','CT','CO','CA','AR','AZ','AK','AL'];

    let setStateColor = (abbr, color) => {
        let element = document.getElementById(abbr);
        if (element.tagName === "path") element.style.fill = color;
        else element.style.backgroundColor = color;
    }

    let probToColorIntensity = prob => {
        let intensity = Math.floor((1 - prob) * 500);
        return intensity <= 255 ? intensity : 255;
        // uses the probability as a % of 500 and then cuts it off at 255 (rather than just taking a % of 255) in order to approximate
        // 538's soothing visual aesthetic of pale chloropleths that fade to white when the odds are close to 50%.
    }

    for(let i=0; i<50; i++){
        document.getElementById(stateAbbrs[i]).setAttribute("title", stateNameList[i]);
    }

    fetch("https://projects.fivethirtyeight.com/2020-general-data/presidential_national_toplines_2020.csv").then(res => {
        if(!res.ok) throw new Error("Problem retrieving national data from FiveThirtyEight.com");
        else return res;
    }).then(res => res.text()).then(data => {
        let currentNat = data.split("\n")[1].split(",");
        let trumpWinProb = currentNat[7];
        let bidenWinProb = currentNat[8];
        document.getElementById("trump-prob").innerHTML = `${Math.round(1000 * trumpWinProb) / 10}%`;
        document.getElementById("biden-prob").innerHTML = `${Math.round(1000 * bidenWinProb) / 10}%`;
        document.getElementById("trump-ev").innerHTML = Math.round(currentNat[14]);
        document.getElementById("biden-ev").innerHTML = Math.round(currentNat[15]);
    })

    let winProbs = {};

    fetch("https://projects.fivethirtyeight.com/2020-general-data/presidential_state_toplines_2020.csv").then(res => {
        if(!res.ok) throw new Error("Problem retrieving state data from FiveThirtyEight.com");
        else return res;
    }).then(res => res.text()).then(data => {
        let upToDateRows = data.split("\n").slice(1, 57);
        upToDateRows = upToDateRows.map(row => row.split(","));
        upToDateRows.forEach(row => {
            let stateName = row[7];
            winProbs[stateName] = row[10];
        });
        for (let i=0; i<stateNameList.length; i++){
            let trumpWinProb = winProbs[stateNameList[i]];
            if (!document.getElementById(stateAbbrs[i])) continue;
            else if (trumpWinProb > 0.5) setStateColor(stateAbbrs[i], `rgb(255, ${probToColorIntensity(trumpWinProb)}, ${probToColorIntensity(trumpWinProb)})`);
            else if (trumpWinProb < 0.5) setStateColor(stateAbbrs[i], `rgb(${probToColorIntensity(1 - trumpWinProb)}, ${probToColorIntensity(1 - trumpWinProb)}, 255)`);
        }
    }).catch(err => console.log(err));

    document.addEventListener("click", event => {
        if (event.target.tagName !== "path" && !event.target.classList.contains("district")){
            document.getElementById("state-stats").style.display = "none";
        } else {
            let stateName = event.target.getAttribute("data-name");
            document.getElementById("state-page-link").setAttribute("href", `https://projects.fivethirtyeight.com/2020-election-forecast/${stateName.split(" ").join("-").toLowerCase()}/`);
            document.getElementById("state-stats").style.display = "block";
            document.getElementById("state-trump-prob").innerHTML = `${Math.round(winProbs[stateName] * 1000) / 10}%`;
            document.getElementById("state-biden-prob").innerHTML = `${Math.round((1 - winProbs[stateName]) * 1000) / 10}%`;
            document.getElementById("state-name").innerHTML = stateName;
        }
    })
})
