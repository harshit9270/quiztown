function secondScript() {

    var data = Qdata;
    console.log(data, "YAY");

    let myCategoryimages = { "1": "categories/artAndLiterature.jpg", "2": "categories/generalKnowledge.jpg", "3": "categories/geography.jpg", "4": "categories/history.jpg", "5": "categories/music.jpg", "6": "categories/scienceAndNature.jpg", "7": "categories/sport.jpg", "8": "categories/tieBreak.jpg", "9": "categories/tvAndFilms.jpg" };

    let correctMessages = ["Yeah! You did it.", "Yay! You are phenomenal.", "You rule.", "Oh! You are awesome.", "Yeah! Getting into the groove."];
    let wrongMessages = ["Oops! You were close.", "Oo! You missed.", "Oops! Better luck next time.", "Oh! You were this close.", "Hope you will get better :)."];

    let cateId = document.getElementById("categoryValue").innerHTML;
    let levelId = document.getElementById("levelValue").innerHTML;
    let uniqueId = document.getElementById("uniqueId").innerHTML;
    window.score = 0;
    let username = document.getElementById("username").innerHTML;

    console.log(cateId, levelId);

    var lengthofobject = data[cateId][levelId].length;
    console.log(lengthofobject);

    var curPage = 0, correct = 0;
    var myAnswers = [];

    var newimage = document.getElementById("categoryWiseImage");
    var myHeader = document.getElementById("quizHeader");
    var myQuestion = document.getElementById("questions");
    var myAnswerz = document.getElementById("answer");
    var classname = document.getElementsByClassName("answer-btn");
    var answerA = document.getElementsByClassName("answer");
    var progressBar = document.getElementById("progress-bar");
    var btnNext = document.getElementById("btnNext");
    var btnCheck = document.getElementById("btnCheck");
    var btnLevel = document.getElementById('btnLevel');

    checkPage();
    // console.log('hello');

    $("#element").toast({ delay: 2000 });

    btnNext.addEventListener("click", moveNext);
    // btnLevel.addEventListener("click", endQuiz);

    btnCheck.addEventListener("click", () => {
        if (myAnswers[curPage] == undefined) {
            // console.log('not answered');
            document.getElementById("myToast").innerHTML = "Please! Answer the question first.";
            $('#element').toast('show');
        }
    });

    function myAnswer() {
        window.idAnswer = this.getAttribute("data-id");
        console.log(idAnswer, "hey");
        //check for correct answer
        myAnswers[curPage] = idAnswer;
        if (data[cateId][levelId][curPage].correct == idAnswer) {
            console.log('Correct Answer');
            btnCheck.addEventListener("click", doItHard);
            btnCheck.addEventListener("click", correctAns);
            btnCheck.removeEventListener("click", stopIt);
            btnCheck.removeEventListener("click", wrongAns);
        } else if (data[cateId][levelId][curPage].correct != idAnswer) {
            console.log('Wrong Answer');
            btnCheck.addEventListener("click", stopIt);
            btnCheck.addEventListener("click", wrongAns);
            btnCheck.removeEventListener("click", doItHard);
            btnCheck.removeEventListener("click", correctAns);
        }
        addBox();
    }

    function correctAns() {
        $('#element').toast('hide');
        document.getElementById("myToast").innerHTML = correctMessages[Math.floor(Math.random() * 5)];
        $('#element').toast('show');
        displayColor();
    }
    function wrongAns() {
        $('#element').toast('hide');
        document.getElementById("myToast").innerHTML = wrongMessages[Math.floor(Math.random() * 5)];
        $('#element').toast('show');
        displayColor();
    }


    let checkCount = curPage;

    function displayColor() {

        btnCheck.style.display = "none";
        btnNext.style.display = "block";

        checkPage();
        updateScore();

        classname[data[cateId][levelId][curPage].correct - 1].classList.add("correctOne");
        if (checkCount == curPage) {
            if (data[cateId][levelId][curPage].correct == idAnswer) {
                answerA[idAnswer - 1].innerHTML += `<i class="ri-check-line" style="margin-left:10px;"></i>`;
                checkCount++;
            }
            else {
                classname[idAnswer - 1].classList.add("wrongOne");
                answerA[idAnswer - 1].innerHTML += `<i class="ri-close-line" style="margin-left:10px;"></i>`;
                checkCount++;
            }
        }
    }

    function addBox() {
        for (var i = 0; i < myAnswerz.children.length; i++) {
            var curNode = myAnswerz.children[i];
            if (myAnswers[curPage] == (i + 1)) {
                if (btnCheck.style.display != "none")
                    curNode.classList.add("selectAnswer");
            } else {
                curNode.classList.remove("selectAnswer");
            }
        }
    }

    function moveNext() {
        btnNext.style.display = "none";
        btnCheck.style.display = "block";

        //check if an answer has been made
        if (myAnswers[curPage]) {
            if (curPage < (lengthofobject - 1)) {
                curPage++;
                checkPage(curPage);
            }
        } else {
            console.log('not answered');
            document.getElementById("myToast").innerHTML = "Please! Answer the question first.";
            $('#element').toast('show');
        }
    }


    function endQuiz() {
        if (myAnswers[(lengthofobject - 1)]) {
            var output = "<div class='output'><h1>Quiz Results</h1><BR>";
            var questionResult = "NA";
            //console.log('Quiz Over');
            for (var i = 0; i < myAnswers.length; i++) {
                if (data[cateId][levelId][i].correct == myAnswers[i]) {
                    questionResult = '&nbsp; <i class="fa fa-check correct"></i>';
                    correct++;
                } else {
                    questionResult = '&nbsp;<i class="fa fa-times wrong"></i>';
                }
                output = output + '<p>Question ' + (i + 1) + ' ' + questionResult + '</p> ';
            }
            var Correct1 = data[cateId][levelId][0].correct;
            var Correct2 = data[cateId][levelId][1].correct;
            // var Correct3 = data[cateId][levelId][2].correct;
            // var Correct4 = data[cateId][levelId][3].correct;
            // var Correct5 = data[cateId][levelId][4].correct;

            // output += '<a href="/categories"><button class="start" style="border: 2px solid rgb(69, 8, 112);outline:none;padding:4px;font-size: 1.5rem;border-radius:6px;color: rgb(69, 8, 112);">Play again<i class="fa fa-play-circle-o"></i></button></a><p>Correct answers are : </p> <p style="color:yellowgreen;"> ' + data[cateId][levelId][0].answers[Correct1 - 1] + ' , ' + data[cateId][levelId][1].answers[Correct2 - 1] + ' , ' + data[cateId][levelId][2].answers[Correct3 - 1] + ' , ' + data[cateId][levelId][3].answers[Correct4 - 1] + ' , ' + data[cateId][levelId][4].answers[Correct5 - 1] + '</p>';
            output += '<a href="/categories"><button class="start" style="border: 2px solid rgb(69, 8, 112);outline:none;padding:4px;font-size: 1.5rem;border-radius:6px;color: rgb(69, 8, 112);">Play again<i class="fa fa-play-circle-o"></i></button></a><p>Correct answers are : </p> <p style="color:yellowgreen;"> ' + data[cateId][levelId][0].answers[Correct1 - 1] + ' , ' + data[cateId][levelId][1].answers[Correct2 - 1] + ' , ' + '</p>';
            output = output + '<p style="color:turquoise;">Hey there , You scored ' + (correct * levelId) + ' points out of ' + (lengthofobject * levelId) + '</p></div> ';
            document.getElementById("rightBox").innerHTML = output;

        } else {
            //console.log('not answered');
        }
    }


    function updateScore() {
        if (data[cateId][levelId][curPage].correct == myAnswers[curPage]) {
            console.log("Yaaaaaaaaaaaaaaaaay");
            window.score++;
            console.log(score, "updated");
            saveprog();
        }
        else if (data[cateId][levelId][curPage].correct != myAnswers[curPage]) {
            console.log("Ooooooooooooooops");
            console.log(score, "updated2");
        }
    }

    console.log(score, "updated3");

    function checkPage() {
        //add remove disabled buttons 
        if ((curPage + 1) < (lengthofobject)) {
            btnLevel.classList.add("hide");
        } else {
            btnNext.setAttribute("disabled", "true");
            if (btnNext.style.display == "block")
                btnLevel.classList.add("show");
        }

        var myObj = data[cateId][levelId][curPage];

        myHeader.innerHTML = ("Level " + levelId);
        myQuestion.innerHTML = myObj.question;

        newimage.src = myCategoryimages[cateId];

        myAnswerz.innerHTML = "";
        var addSelClass = '';

        // console.log(myAnswers[curPage]);
        for (var index in myObj.answers) {

            if (myAnswers[curPage] == (parseInt(index) + 1)) {
                addSelClass = "selectAnswer";
            } else {
                addSelClass = "";
            }
            myAnswerz.innerHTML += `<button data-id="${(parseInt(index) + 1)}" class="answer-btn ${addSelClass}"> <a class="answer"> ${myObj.answers[index]} </a> </button>`;

        }

        for (var i = 0; i < classname.length; i++) {
            classname[i].addEventListener("click", myAnswer, false);
        }

        //Update progressBar
        increment = Math.ceil((curPage + 1) / (lengthofobject) * 100);
        progressBar.style.width = (increment) + '%';
        progressBar.innerHTML = (curPage + 1) + ' of ' + lengthofobject;
    }


    // savingProgress



    window.saveprog = function saveProgress() {
        let progressData = { username: username, uniqueId: uniqueId, levelId: levelId, cateId: cateId, score: window.score , levelLength: lengthofobject};
        console.log(progressData, "updated");
        console.log("function save works");
        fetch('/saveprogress', {
            method: 'post',
            headers: {
                'Accept': 'application/json, text/plain, */*',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(progressData)
        }).then(res => res.json())
            .then(res => console.log(res));

    }
    // secondScript ends here
}