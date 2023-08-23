import React from 'react'
import {Routes,HashRouter,Route} from 'react-router-dom'
import DataWrapper from './context/DataWrapper'
import Page1 from './Page1'
import './App.css'
import HomePage from './pages/HomePage'
import MainPage from './pages/MainPage'
import Leave from './pages/Leave'

export default function App() {
  return (
    <DataWrapper>
    {/* this is render as data wrapper child */}
    <HashRouter>
        <Routes>
            {/* <Route path ="/" element={<MainPage/>}/> */}
            <Route path='/' element={<HomePage/>}/>
            <Route path='/meeting' element={<MainPage/>}/>
            <Route path='/meeting/:link' element={<MainPage/>}/>
            <Route path='/leave' element={<Leave/>}/>
            {/* <Route path='' element={<></>}/> */}
        </Routes>
    </HashRouter>
    </DataWrapper>
    
  )
}
