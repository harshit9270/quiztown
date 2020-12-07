var quizData = [];

function fetchData() {

    fetch("/getQuizData") // Call the fetch function passing the url of the API as a parameter
        // Handle success
        .then(response => response.json())  // convert to json
        .then((data) => {
            quizData = data;
            inputData(quizData);
        })    //print data to console
        .catch(err => console.log('Request Failed', err)); // Catch errors

    return "quizData";
}
fetchData();

var Qdata = {};

function inputData(quizData) {

    for (let j = 1; j <= 9; j++) {
        Qdata[j] = {};
        for (let k = 1; k <= 10; k++) {
            Qdata[j][k] = [];
        }
    }

    for (let i = 0; i < quizData.length; i++) {
        for (let j = 1; j <= 9; j++) {
            for (let k = 1; k <= 10; k++) {

                if (quizData[i].categoryId == j) {
                    if (quizData[i].levelId == k) {

                        let answers = [`${quizData[i].option1}`,`${quizData[i].option2}`,`${quizData[i].option3}`,`${quizData[i].option4}`];
                        Qdata[j][k].push({
                            question: `${quizData[i].question}`,
                            correct: `${quizData[i].correct}`,
                            answers: answers
                        });

                    }
                }

            }
        }
    }

    // function ends
    // console.log(JSON.stringify(Qdata));
    secondScript();
}

