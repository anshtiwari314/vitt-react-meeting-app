import React from 'react'
import {Routes,HashRouter,Route} from 'react-router-dom'
import DataWrapper from './context/DataWrapper'
import Page1 from './Page1'
import './App.css'
import HomePage from './HomePage'

export default function App() {
  return (
    <DataWrapper>
    <HashRouter>
        <Routes>
            <Route path='/' element={<HomePage/>}/>
            <Route path='/meeting' element={<Page1/>}/>
            <Route path='/meeting/:link' element={<Page1/>}/>
            {/* <Route path='' element={<></>}/> */}
        </Routes>
    </HashRouter>
    </DataWrapper>
    
  )
}
