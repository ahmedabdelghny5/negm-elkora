import express from 'express'
import { initApp } from './src/modules/initApp.js'
const app = express()


initApp(app,express)

/**
 * 1 get all captins
 * 2 get all child answer task    ? degree "optional" عاوز الأطفال اللى عملوا تاسك معينة
 * 3 التاسكات اللى طفل معين عملها
 * 4 virtual populate => كل التاسكات موما بالناس اللى حلتها 
 * 5- documentaion , vercel , 
 */
