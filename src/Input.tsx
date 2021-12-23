import React, {useEffect, useState} from 'react';
import s from './style.module.css'
import axios from "axios";

type SearchUserType = {
    login: string
    id: number
}
type SearchResult = {
    items: Array<SearchUserType>
}
type UserType = {
    login: string
    id: number
    avatar_url: string
    followers: number
}
type SearchPropsType = {
    value: string
    onSubmit: (value: string) => void
}
export const Search = (props: SearchPropsType) => {
    const [tempSearch, setTempSearch] = useState(props.value)
    useEffect(() => {
        setTempSearch(props.value)
    },[props.value])
    return (
        <div>
            <input
                placeholder={'search'}
                value={tempSearch}
                onChange={(e) => {
                    setTempSearch(e.currentTarget.value)
                }}
            />
            <button onClick={() => {
                props.onSubmit(tempSearch)
            }}>find
            </button>
        </div>
    )
}
type UserListPropsType = {
    term: string
    selectedUser: SearchUserType | null
    onUserSelect: (user: SearchUserType) => void
}
export const UsersList = (props: UserListPropsType) => {
    const [users, setUsers] = useState<SearchUserType[]>([])
    // catch users array and display it
    useEffect(() => {
        console.log('SYNC USERS')
        axios
            .get<SearchResult>(`https://api.github.com/search/users?q=${props.term}`)
            .then(res => {
                setUsers(res.data.items)
            })
    }, [props.term])
    return     <ul>
        {users
            .map(u => <li key={u.id}
                          className={props.selectedUser === u ? s.selected : ''}
                          onClick={() => {
                              props.onUserSelect(u)
                          }}>
                {u.login}
            </li>)}
    </ul>
}
type TimerPropsType = {}
export const Timer = (props: TimerPropsType) => {
    const [seconds, setSeconds] = useState(60)
    useEffect(() => {
        setTimeout(() => {setSeconds((seconds) => seconds - 1)}, 1000)
    }, [seconds])
    return <div>
        {seconds}
    </div>
}

type UserInfoPropsType = {
    user: SearchUserType | null
}
export const UserInfo = ({user}: UserInfoPropsType) => {
    const [userDetails, setUserDetails] = useState<UserType | null>(null)
    // take details from users array and display it
    useEffect(() => {
        console.log('SYNC USER DETAIL')
        if (!!user) {
            axios
                .get<UserType>(`https://api.github.com/users/${user.login}`)
                .then(res => {
                    setUserDetails(res.data)
                })
        }
    }, [user])
    return <div>
        <Timer />
        <h2>{userDetails?.login}</h2>
        {userDetails && <div>
            <img src={userDetails.avatar_url}/>
            <br/>
            {userDetails.login}, follower: {userDetails.followers}
        </div>}
    </div>
}

export function Input() {
    const [selectedUser, setSelectedUser] = useState<SearchUserType | null>(null)
    let initialSearchState = 'Is any body here?'
    const [searchTerm, setSearchTerm] = useState(initialSearchState)
// change doc title
    useEffect(() => {
        console.log('SYNC TITLE')
        if (selectedUser) {
            document.title = selectedUser.login
        }
    }, [selectedUser])

    return (
        <div className={s.main}>
            <div>
                <Search value={searchTerm} onSubmit={(value: string) => setSearchTerm(value)}/>
                <button onClick={() => {setSearchTerm(initialSearchState)}}>Reset</button>
                <UsersList term={searchTerm} selectedUser={selectedUser} onUserSelect={setSelectedUser} />
            </div>
            <div>
                <UserInfo user={selectedUser} />
            </div>
        </div>
    );
}
