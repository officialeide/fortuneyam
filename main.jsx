import React from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import SajuReport from './SajuReport.jsx'

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <SajuReport />
  </React.StrictMode>
)
