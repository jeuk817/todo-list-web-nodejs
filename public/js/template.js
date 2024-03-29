class Template {
    jsFile(userID, userTodo) {
        let userTodoString;
        if (userTodo) {
            userTodoString = JSON.stringify(userTodo);
            console.log('로그인되있음')
        } else {
            console.log('로그인 안됌')
        }
        return `
        
class DynamicEvent {
    constructor() {
        this.card;
        this.classMemo = document.getElementsByClassName('memo');
    }

    updateFrontEnd(e, ev, text) {
        e.target.textContent = text;
        ev.target.parentNode.removeChild(ev.target);
        this.toggleClass({ target: e.target, className: 'displayNone' });
    }

    async updateBackEnd(e, text) {
        const updatedSchedule = {};
        Array.prototype.forEach.call(e.target.parentNode.childNodes, (el, i) => {
            if (el === e.target) {
                updatedSchedule.status = e.target.parentNode.id;
                updatedSchedule.text = text;
                updatedSchedule.index = i;
            }
        });
        const str = JSON.stringify(updatedSchedule);
        const response = await fetch('/updateSchedule', {
            method: 'POST',
            body: str
        });
    }

    setModifyNote(e) {
        document.querySelectorAll('.modifyNote').forEach(memo => {
            memo.addEventListener('keydown', (ev) => {
                if (ev.keyCode === 13) {
                    var text = ev.target.value;
                    if (text.length === 0) {
                        const text = '스케줄을 입력해 주세요.';
                        this.showNote(text, 1500);
                    } else {
                        this.updateFrontEnd(e, ev, text);

                        this.updateBackEnd(e, text)
                    }
                }
            })
        })
    }

    updateSchedule() {
        const schedules = document.querySelectorAll('.schedule');
        schedules.forEach(schedule => {
            schedule.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleClass({ target: e.target, className: 'displayNone' });
                e.target.insertAdjacentHTML('beforebegin', '<input type="text" class="modifyNote" value="' + e.target.textContent + '">');

                this.setModifyNote(e);

                e.stopImmediatePropagation();
            })
        })
    }

    addSchedule() {
        const addScheduleButtons = document.querySelectorAll(".addSchedule");
        addScheduleButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                if (e.target.closest(".status").querySelector('.memo').childNodes.length === 0 || e.target.closest(".status").querySelector('.memo').lastChild.className !== 'memoNote') {
                    const data = '<input type="text" class="memoNote">';
                    this.insertElement({ target: e.target.closest(".status").querySelector('.memo'), index: 'beforeend', data });
                    this.setMemoEvent();
                }
            })
        })
    }

    setMemoEvent() {
        const memoNote = document.querySelectorAll(".memoNote");
        memoNote.forEach(text =>{
            text.addEventListener("keydown", async (e) => {
                if (e.keyCode === 13) {
                    var text = e.target.value;
                    if (text.length === 0) {
                        const text = '스케줄을 입력해 주세요.';
                        this.showNote(text, 1500);
                    } else {
                        const statusAndText = 'status=' + e.target.parentNode.id + '&text=' + text;
                        const response = await fetch('/createSchedule', {
                            method: 'POST',
                            body: statusAndText
                        });
                        const data = '<p class="schedule" draggable="true">' + text + '</p>';
                        this.insertElement({ target: e.target, index: 'afterend', data });
                        e.target.parentNode.removeChild(e.target);
                        this.updateSchedule();
                    }
                }
            });
        })
    }

    holdLoginWindow() {
        const loginElements = document.querySelectorAll(".loginWindow > div > input");
        loginElements.forEach(element => {
            element.addEventListener("focus", (e) => e.target.closest(".loginWindow").classList.toggle("loginWindowActive"))
            element.addEventListener("blur", (e) => e.target.closest(".loginWindow").classList.toggle("loginWindowActive"))

        });
    }

    toggleClass({ target, className }) {
        target.classList.toggle(className)
    }

    insertElement({ target, index, data }) {
        target.insertAdjacentHTML(index, data);
    }

    applyDynamicEvent(target) {
        if (target.className === "schedule") {
            this.toggleClass({ target, className: 'activeSchedule' });
        } else if (target.className === "schedule activeSchedule") {
            this.toggleClass({ target, className: 'activeSchedule' });
        }
        if (target.id === "trashCan") {
            this.toggleClass({ target, className: 'activeTrashCan' });
        }
    }

    dragDrop() {
        document.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('Text', e.target.firstChild.nodeValue);
            this.card = e.target;
        })

        document.addEventListener("dragenter", (e) => {
            this.applyDynamicEvent(e.target);

        }, false);

        document.addEventListener("dragleave", (e) => {
            this.applyDynamicEvent(e.target);
        }, false);

        document.addEventListener("dragover", (e) => {
            e.preventDefault();
        });

        document.addEventListener("drop", async (e) => {
            e.preventDefault();
            var data = e.dataTransfer.getData('Text');
            const schedule = '<p class="schedule" draggable="true">' + data + '</p>';
            
            if (e.target.className === "schedule activeSchedule") {
                
                
                this.toggleClass({ target: e.target, className: 'activeSchedule' });
                this.insertElement({ target: e.target, index: 'beforebegin', data: schedule });
                this.card.parentNode.removeChild(this.card);
            }
            if (e.target.className === "addSchedule") {

                this.insertElement({ target: e.target.closest(".status").querySelector('.memo'), index: 'beforeend', data: schedule });
                this.card.parentNode.removeChild(this.card);
            }
            if (e.target.nodeName === "LI") {

                this.insertElement({ target: e.target.closest(".status").querySelector('.memo'), index: 'beforeend', data: schedule });
                this.card.parentNode.removeChild(this.card);
            }
            if (e.target.className === "title") {

                this.insertElement({ target: e.target.closest(".status").querySelector('.memo'), index: 'afterbegin', data: schedule });
                this.card.parentNode.removeChild(this.card);
            }
            if (e.target.id === "trashCan") {

                this.toggleClass({ target: e.target, className: 'activeTrashCan' });
                this.card.parentNode.removeChild(this.card);
            }
            
            const changedTodoString = this.getChangedTodoString();
            const response = await fetch('/changeSchedule', {
                method: 'POST',
                body: changedTodoString
            });
            this.updateSchedule();
        });
    }

    getChangedTodoString() {
        const changedTodo = Array.prototype.reduce.call(this.classMemo, (obj, list) => {
            obj[list.id] = [];
            Array.prototype.forEach.call(list.childNodes, (shedule) => {
                obj[list.id].push(shedule.textContent);
            })
            return obj;
        }, {});

        return JSON.stringify(changedTodo);
    }

    insertUserSchedule(userTodoString) {
        const obj = JSON.parse(userTodoString)
        for (status in obj) {
            obj[status].forEach(schedule => {
                const target = document.querySelector('#' + status);
                const element = '<p class="schedule" draggable="true">' + schedule + '</p>';
                this.insertElement({ target, index: 'beforeend', data: element });
            })
        }
    }
}

class LoginSignup {

    constructor(dynamicEvent) {
        this.dynamicEvent = dynamicEvent;
        this.note = document.getElementById('note');
        this.signUpBtn = document.getElementById('signUpBtn');
        this.backToLogin = document.getElementById('back');
        this.userNameToUse = document.getElementById('userNameToUse');
        this.identification = document.getElementById('identification');
        this.createID = document.getElementById('createID');
        this.username = document.getElementById('username');
        this.password = document.getElementById('password');
        this.loginBtn = document.getElementById('loginBtn');
        this.userPage = document.getElementById('userPage');
        this.userName = document.getElementById('userName');
        this.logOut = document.getElementById('logOut');
        this.loginContainer = document.getElementById('loginContainer');
    }

    changeLoginWindow() {
        const informs = document.getElementsByClassName('inform');
        for (let i = 0; i < informs.length; i++) {
            informs[i].value = '';
        }
        const loginContainer = document.getElementById('loginContainer');
        const signUpContainer = document.getElementById('signUpContainer');
        loginContainer.classList.toggle('displayNone');
        signUpContainer.classList.toggle('displayNone');
    }

    ischeckedID() {
        if (this.userNameToUse.dataset.possible === 'yes') {
            return true;
        } else {
            return false;
        }
    }

    clickSignupBackToLogin() {
        this.signUpBtn.addEventListener('click', (e) => {
            this.changeLoginWindow();
        })
        this.backToLogin.addEventListener('click', (e) => {
            this.changeLoginWindow();
        })
    }

    changeDataSetPossibleNo() {
        this.userNameToUse.addEventListener('keydown', (e) => {
            this.userNameToUse.dataset.possible = "no";
        })
    }

    clickIdentification() {
        this.identification.addEventListener('click', async (e) => {
            const userNameToUseValue = this.userNameToUse.value;

            if (!/^[a-z0-9+]{4,12}$/.test(userNameToUseValue) || / /.test(userNameToUseValue)) {
                const text = '공백없는 영소문자, 숫자 조합의 4~12글자만 가능합니다.';
                this.showNote(text, 1500);
            } else if (!/[a-z]/.test(userNameToUseValue)) {
                const text = '영어(소문자)가 없습니다.';
                this.showNote(text, 1500);
            } else if (!/[0-9]/.test(userNameToUseValue)) {
                const text = '숫자가 없습니다.';
                this.showNote(text, 1500);
            } else {
                try {
                    const id = 'id=' + userNameToUseValue;
                    const response = await fetch('/identification', {
                        method: 'POST',
                        body: id
                    })
                    const data = await response.text();
                    if (data === 'Not exit') {
                        this.userNameToUse.dataset.possible = "yes"
                        const text = '사용가능한 아이디입니다.';
                        this.showNote(text, 1500);
                    } else {
                        this.userNameToUse.dataset.possible = "no"
                        const text = '이미 사용중인 아이디입니다.';
                        this.showNote(text, 1500);
                    }
                } catch (err) {
                    throw err;
                }
            }
        })
    }

    clickCreateID() {
        this.createID.addEventListener('click', async (e) => {
            const passwordToUse = document.getElementById('passwordToUse').value;
            const confirmPassword = document.getElementById('confirmPassword').value;

            if (this.ischeckedID()) {
                if (passwordToUse.length < 8) {
                    const text = '비밀번호는 최소 8자리 이상 입력해주세요';
                    this.showNote(text, 1500);
                } else {
                    if (passwordToUse !== confirmPassword) {
                        const text = '비밀번호가 일치하지 않습니다.';
                        this.showNote(text, 1500);
                    } else {
                        const idAndPwd = 'id=' + this.userNameToUse.value + '&pwd=' + passwordToUse;
                        const response = await fetch('/createID', {
                            method: 'POST',
                            body: idAndPwd
                        })
                        const data = await response.text();
                        if (data === 'create') {
                            this.changeLoginWindow();
                            const text = '아이디가 생성되었습니다.';
                            this.showNote(text, 1500);
                        } else {
                            const text = '실패';
                            this.showNote(text, 1500);
                        }
                    }
                }
            } else {
                const text = '아이디 중복체크를 해주세요.';
                this.showNote(text, 1500);
            }
        })
    }

    clickLoginBtn() {
        this.loginBtn.addEventListener('click', async (e) => {
            const idAndPwd = 'id=' + this.username.value + '&pwd=' + this.password.value;
            const response = await fetch('/login', {
                method: 'POST',
                body: idAndPwd
            });
            const data = await response.text();
            if (data === 'success') {
                document.location.reload();
            } else {
                const text = '없는 아이디거나 비밀번호가 틀렸습니다.';
                this.showNote(text, 1500);
            }
        })
    }

    setUserEnvironment(userTodoString, userID) {
        if (userTodoString !== 'undefined' && userID !== 'undefined') {
            this.dynamicEvent.insertUserSchedule(userTodoString);
            this.userName.innerHTML = 'ID: ' + userID;
            this.dynamicEvent.toggleClass({ target: this.userPage, className: 'displayNone' });
            this.dynamicEvent.toggleClass({ target: this.loginContainer, className: 'displayNone' });
            const text = userID + '님 안녕하세요!';
            this.showNote(text, 2000);
        }
    }

    clickLogOutBtn() {
        this.logOut.addEventListener('click', async (e) => {
            const response = await fetch('/logOut', {
                method: 'GET'
            });
            if (response.ok) {
                document.location.reload();
            } else {
                const text = '로그아웃 실패';
                this.showNote(text, 1500);
            }
        })
    }

    showNote(text, sec) {
        this.note.innerHTML = text;
        this.dynamicEvent.toggleClass({ target: this.note, className: 'activeNote' });
        setTimeout(() => {
            this.dynamicEvent.toggleClass({ target: this.note, className: 'activeNote' });
        }, sec)
    }
}

let userData = {}

const dynamicEvent = new DynamicEvent();
dynamicEvent.dragDrop();
dynamicEvent.holdLoginWindow();
dynamicEvent.addSchedule();


const loginSignup = new LoginSignup(dynamicEvent);
loginSignup.clickCreateID();
loginSignup.clickIdentification();
loginSignup.changeDataSetPossibleNo();
loginSignup.clickSignupBackToLogin();
loginSignup.clickLoginBtn();
loginSignup.setUserEnvironment('${userTodoString}', '${userID}');
loginSignup.clickLogOutBtn();
dynamicEvent.updateSchedule();

        `
    }
}

module.exports = Template;