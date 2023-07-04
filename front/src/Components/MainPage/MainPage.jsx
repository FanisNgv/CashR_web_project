import React, {useEffect, useState} from 'react';
import './MainPage.css';
import axios from 'axios';
import {useNavigate} from 'react-router-dom';
import {Backdrop, CircularProgress} from '@mui/material';

import {Link} from "react-router-dom";
import Menu from "../Menu/Menu";
import ModalAddTrans from "../Modal/ModalAddTrans";
import MyDatePickerRange from "../DatePicker/DatePickerRange";
import {disableBodyScroll, enableBodyScroll} from "body-scroll-lock";
import ProfileMenu from "../Menu/ProfileMenu";
import ModalFilter from "../Modal/ModalFilter";

const MainPage = () => {
    const [isLoading, setIsLoading] = useState();
    const [user, setUser] = useState({
        lastname: "",
        firstname: "",
        email: "",
        role: ""
    });
    const [users, setUsers] = useState([]);
    const [menuActive, setMenuActive] = useState(false);
    const[profileActive, setProfileActive] = useState(false);
    const[modalFilterIsOpened, setModalFilterIsOpened] = useState(false);
    const navigate = useNavigate();

    const [come, setCome] = useState();
    const [addTransactionIsOpened, setAddTransactionIsOpened] = useState(false);
    const [typesOfOutcomes, setTypesOfOutcomes] = useState(["Еда", "Здоровье", "Спорт", "Жилье"]);
    const [typesOfIncomes, setTypesOfIncomes] = useState(["Зарплата", "Стипендия"]);
    const [transactions, setTransactions] = useState([]);
    const [sortedTransactions, setSortedTransactions] = useState([]);

    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(null);

    const[leftBorder, setLeftBorder] = useState();
    const[rightBorder, setRightBorder] = useState();

    const MenuItems = [{value: "Транзакции", action: handleTransClick, icon: "trans"},{
        value: "Анализ транзакций",
        action: handleTransAnalyseClick,
        icon: "analyse"
    }, {
        value: "Добавить расход/доход",
        action: handleAddTransClick,
        icon: "coin"
    }];

    const ProfileItems=[{value: "Выйти", action: handleLogoutClick, icon: "logout"}]

    function handleTransAnalyseClick(){
        navigate('/transAnalyse');
    }
    function handleTransClick(){
        navigate('/transactions');
    }
    function handleLogoutClick() {
        navigate('/login');
        localStorage.clear();
    }

    function handleAddTransClick() {
        setMenuActive(false);
        setAddTransactionIsOpened(true);
    }

    useEffect(() => {
        setIsLoading(true);
        const fetchData = (async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                console.error('Token not found in localStorage');
                return;
            }
            try {
                const {data: response} = await axios.get('http://localhost:5000/auth/user', {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                await setUser({
                    _id: response._id,
                    lastname: response.lastname,
                    firstname: response.firstname,
                    email: response.email,
                    role: response.roles[0],
                    balance: response.balance,
                });

                const transactionsResponse = await fetch('http://localhost:5000/user/getTransactions', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({userID: response._id}),
                });

                const transactionsData = await transactionsResponse.json();
                setTransactions(transactionsData);


            } catch (error) {
                console.error(error.message);
            }

            setIsLoading(false);
        });
        fetchData();
    }, []);

    function getDateValue(dateString) {
        return new Date(dateString).getTime();
    }
    useEffect(()=>{
        const srtdTransactions = [...transactions].sort(function(a, b) {
            return getDateValue(b.dateOfTransaction) - getDateValue(a.dateOfTransaction);
        });
        setSortedTransactions(srtdTransactions);
    },[transactions])

    function toggleMenu() {
        setMenuActive(!menuActive);
    }
    function toggleProfile(){
        setProfileActive(!profileActive);
    }
    function toggleModalFilter(){
        setModalFilterIsOpened(!modalFilterIsOpened);
    }

    const[standartSet, setStandartSet] = useState([]);
    function getDateValue(dateString) {
        return new Date(dateString).getTime();
    }
    useEffect(()=>{
        const srtdTransactions = [...transactions].sort(function(a, b) {
            return getDateValue(b.dateOfTransaction) - getDateValue(a.dateOfTransaction);
        });
        setStandartSet(srtdTransactions);
    },[transactions])


    return (
        <div className="Users">
            <header>
                <div className="MainBar">
                    <h1 className="logo" onClick={toggleMenu}>CashR</h1>
                    <div className="userName" onClick={toggleProfile}>
                        <div className="projectIcon">
                            <span className="material-symbols-outlined">person</span>
                        </div>
                        <h1>{user.lastname} {user.firstname}</h1>
                    </div>
                </div>
            </header>
            <div className="mainContent">
                <div className="filterRow">
                    <h1>Транзакции:</h1>
                    <span onClick={toggleModalFilter} className="material-symbols-outlined">filter_list</span>
                </div>


                <div className="transHeader">
                    <div><h1>Сумма</h1></div>
                    <div><h1>Тип транзакции</h1></div>
                    <div><h1>Дата транзакции</h1></div>
                </div>

                <div>
                    {sortedTransactions && sortedTransactions.map((transaction) => (
                        <div className="transRow" key={transaction._id}>
                            <div className='comeContainer'>
                                <div className='comeOutcome'>
                                    <h2>{transaction.come === 'Outcome' && transaction.valueOfTransaction}</h2></div>
                                <div className='comeIncome'>
                                    <h2>{transaction.come === 'Income' && '+' + transaction.valueOfTransaction}</h2>
                                </div>
                            </div>
                            <div><h2>{transaction.typeOfTransaction}</h2></div>
                            <div><h2>{new Intl.DateTimeFormat('ru-Ru', {
                                year: 'numeric',
                                month: 'numeric',
                                day: 'numeric',
                                hour: 'numeric',
                                minute: 'numeric',
                                second: 'numeric'
                            }).format(new Date(transaction.dateOfTransaction))}</h2></div>
                        </div>
                    ))}
                </div>
            </div>
            <ModalFilter leftBorder={leftBorder} standartSet={standartSet} setStandartSet={setStandartSet} transactions={transactions} setLeftBorder={setLeftBorder} rightBorder={rightBorder} setRightBorder={setRightBorder} modalFilterIsOpened={modalFilterIsOpened} setModalFilterIsOpened={setModalFilterIsOpened} sortedTransactions={sortedTransactions} setSortedTransactions={setSortedTransactions}/>
            <ModalAddTrans come={come} setUser={setUser} user={user} setTransactions={setTransactions}
                           setIsLoading={setIsLoading} setCome={setCome} typesOfIncomes={typesOfIncomes}
                           typesOfOutcomes={typesOfOutcomes} setAddTransactionIsOpened={setAddTransactionIsOpened}
                           addTransactionIsOpened={addTransactionIsOpened}/>
            <Menu active={menuActive} setActive={setMenuActive} action={true} header={"Главное меню"}
                  items={MenuItems}/>
            <ProfileMenu items={ProfileItems} userBalance={user.balance} userEmail={user.email} active={profileActive} setActive={setProfileActive} action={true} header={"Профиль"}/>
            <Backdrop open={isLoading}>
                <CircularProgress/>
            </Backdrop>
            <div id="addGap"></div>
            <footer>
                <a href="https://vk.com/fanis_ng" target="_blank"><i className="fa-brands fa-vk"></i></a>
                <a href="https://t.me/fanis_ng" target="_blank"><i className="fa-brands fa-telegram"></i></a>
                <a href="https://www.youtube.com/@fanisnigamadyanov8262/featured" target="_blank"><i className="fa-brands fa-youtube"></i></a>
            </footer>
</div>
);
};

export default MainPage;