const Sales = require('../models/sales');
const Livestock = require('../models/livestock');
const { catchAsync } = require('../controllers/errorHandler');

// Create a new sale
exports.createSale = catchAsync(async (req, res, next) => {
  const sale = await Sales.create(req.body);

  // Update livestock status to 'Sold
  await Promise.all(sale.livestock.map(async (item) => {
    await Livestock.findByIdAndUpdate(item.livestockId, { status: 'Sold' });
  }));

  res.status(201).json({ 
    status: "success", 
    data: sale
  });
});

// Get all sales 
exports.getAllSales = catchAsync(async (req, res) => {
  const sales = await Sales.find().populate('Livestock.livestockId');

  res.status(201).json({ 
    status: "success", 
    data: sales
  });
});

//Get all Batch sales 
exports.getAllBatchSales = catchAsync(async (req, res) => {
  const sales = await Sales.find({ saleType: 'batch' }).populate('Livestock.livestockId');

  res.status(201).json({ 
    status: "success", 
    data: sales
  });
})

// Get a specific sale by ID
exports.getSale = catchAsync(async (req, res) => {
  const sale = await Sales.findById(req.params.id).populate('Livestock.livestockId');
  
  if (!sale) 
    return res.status(404).json({ 
      status: "fail", 
      message: "Sale history not found"
     });

  res.status(200).json({ 
    status: "success", 
    data: sale
  });
});

//Get specific batch sale 
exports.getBatchSale = catchAsync(async (req, res) => {
  const sale = await Sales.findOne({ _id: req.params.id, saleType: 'batch' }).populate('Livestock.livestockId');
  
  if (!sale) 
    return res.status(404).json({ 
      status: "fail", 
      message: "Batch sale history not found"
     });

  res.status(200).json({ 
    status: "success", 
    data: sale
  });
});
// Update a sale 
exports.updateSale = catchAsync(async (req, res) => {
  const sale = await Sales.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({ 
    status: "success", 
    data: sale
  });
});

// Delete a sale 
exports.deleteSale = catchAsync(async (req, res) => {
  await Sales.findByIdAndDelete(req.params.id);

  res.status(200).json({ 
    status: "success", 
    data: null
  });
})
//Get sales personnel 

//Get buyers 
exports.getBuyers = catchAsync(async (req, res) => {
  const buyer = await Sales.find().distinct('buyer.name');

  res.status(200).json({ 
    status: "success", 
    results: buyer.length,
    data: buyer
  });
})

//Get sales within a date range