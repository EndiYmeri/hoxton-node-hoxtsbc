import  express  from "express";
import cors from "cors"
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs"
// this loads all variables created in the .env file
import 'dotenv/config'

// We can then access any variable with:
process.env.MY_VARIABLE_NAME

const prisma = new PrismaClient({log: ["query", "info", "warn", "error"]})

const app = express()
app.use(cors())
app.use(express.json())

const PORT = 4000

function getRandomInt() {
    let min = Math.ceil(0);
    let max = Math.floor(9999999);
    return Math.floor(Math.random() * (max - min) + min); //The maximum is exclusive and the minimum is inclusive
  }

app.post('/register',async (req, res) => {
    
    const {name, email, password} = req.body
    try{
        // create a hash
        const hash = bcrypt.hashSync(password, 8)
        const registeredUser = await prisma.user.create({
            data:{name,email, password: hash, amount: getRandomInt()},
            include: {transactions: true}
        }) 
        res.send(registeredUser)

    }catch(err){
        // @ts-ignore
        res.status(400).send(err.message)
    }
})


app.post('/login',async ( req, res) => {
    const {email, password} = req.body
    try{

        const user = await prisma.user.findUnique({
            where:{email},
            include:{transactions:true}
        })
        if(user){
            const passwordMatches = bcrypt.compareSync(password, user.password)
            if(passwordMatches){
                res.send(user)
            }else{
                throw Error("U dumb")
            }
        }else{
            throw Error("U dumb")
        }

    }catch(err){
        res.status(400).send({error:"User/password invalid!"})
    }

})


app.listen(PORT, ()=>console.log(`Server running on http://localhost:${PORT}`))