document.addEventListener("DOMContentLoaded", ()=> {
    const stateNameList = ['Alabama','Alaska','Arizona','Arkansas','California','Colorado','Connecticut','Delaware','District of Columbia',
    'Florida','Georgia','Hawaii','Idaho','Illinois','Indiana','Iowa',
    'Kansas','Kentucky','Louisiana','ME-1','ME-2','Maine','Maryland','Massachusetts','Michigan',
    'Minnesota','Mississippi','Missouri','Montana','NE-1','NE-2','NE-3','Nebraska','Nevada','New Hampshire','New Jersey',
    'New Mexico','New York','North Carolina','North Dakota','Ohio','Oklahoma','Oregon','Pennsylvania',
    'Rhode Island','South Carolina','South Dakota','Tennessee','Texas','Utah','Vermont','Virginia','Washington',
    'West Virginia','Wisconsin','Wyoming'].reverse();
    const stateAbbrs = [ 'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'DC', 'FL', 'GA', 'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME-1', 'ME-2',
    'ME', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE-1', 'NE-2', 'NE-3', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA',
     'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'].reverse();

    let setStateColor = (abbr, color) => {
        document.getElementById(abbr).style.fill = color;
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
        if (event.target.tagName !== "path"){
            document.getElementById("state-stats").style.display = "none";
        } else {
            let stateAbbr = event.target.getAttribute("id");
            let stateName = stateNameList[stateAbbrs.indexOf(stateAbbr)];
            document.getElementById("state-page-link").setAttribute("href", `https://projects.fivethirtyeight.com/2020-election-forecast/${stateName.split(" ").join("-").toLowerCase()}/`);
            document.getElementById("state-stats").style.display = "block";
            document.getElementById("state-trump-prob").innerHTML = `${Math.round(winProbs[stateName] * 1000) / 10}%`;
            document.getElementById("state-biden-prob").innerHTML = `${Math.round((1 - winProbs[stateName]) * 1000) / 10}%`;
            document.getElementById("state-name").innerHTML = stateName;
        }
    })
})
