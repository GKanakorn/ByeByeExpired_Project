import express from 'express'
import authRoute from './routes/auth.route'
import storageRoute from './routes/storage.route'
import locationRoute from './routes/location.route'
import healthRoute from './routes/health.route'
import barcodeRoute from './routes/barcode.route'
import productRoute from './routes/product.route'


const app = express()
app.use(express.json())

app.use('/auth', authRoute)
app.use('/health', healthRoute)
app.use('/api', locationRoute)
app.use('/api', storageRoute)
app.use('/barcode', barcodeRoute)
app.use('/products', productRoute)

export default app