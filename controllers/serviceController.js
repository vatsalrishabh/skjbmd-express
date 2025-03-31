    const Service = require('../models/Service');
    const {handleErrorWrapper} = require('../middleware/errorHandler');



    //@desc- get details with otp verify and update
    //@ method GET api/service/getAllServices
    //@ access - USER
    const getAllServices = handleErrorWrapper(async(req,res)=>{
        const response = await Service.find({});

        if (response.length > 0) {
            return res.status(200).json({ message: "All the services fetched", data: response });
        }

        // If no services are found, send a 404 response
        return res.status(404).json({ message: "No services found" });
    });


    //@desc- get details with OTP verify and update
    //@ method POST api/service/editAllServices
    //@ access - Admin
    const editAllServices = handleErrorWrapper(async (req, res) => {
        console.log("kjhkhkjh"+req.body)
        const { serviceId, updates } = req.body;  // Destructure serviceId and updates from the request body

        // Ensure updates is an object and serviceId is provided
        if (!serviceId || !updates || typeof updates !== 'object') {
            return res.status(400).json({ message: "Invalid data provided" });
        }

        // Find the service by serviceId and update it with the provided updates
        const response = await Service.findOneAndUpdate(
            { serviceId },   // Search condition
            { $set: updates },  // The update operation
            { new: true }    // Return the updated document
        );

        // Handle the response
        if (response) {
            return res.status(200).json({ message: "Service updated successfully", data: response });
        }

        // If no service found, return a 404 error
        return res.status(404).json({ message: "No service found with the provided ID" });
    });

    //@desc- post new service
    //@ method POST api/service/postNewService
    //@ access - Admin
    const postNewService = handleErrorWrapper(async (req, res) => {
        console.log(req.body);
        const { name, price, category, location, doctorIds } = req.body;  // Destructure service details from the request body

        // Ensure the required fields are present
        if (!name || !price ) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        // Generate unique serviceId
        const number = await Service.countDocuments({}) + 1;
        const serviceId = `SVC${number}`;
        const newService = new Service({
            serviceId, 
            name:"NewService", 
            price:100, 
            category:"blood", 
            location:"Delhi", 
            doctorIds:[], 
            serviveImg:"",
        });

        // Save the service to the database
        await newService.save();

        // Respond with success message
        res.status(201).json({ message: 'Service created successfully', service: newService });
    
    });


    //@desc- post new service
    //@ method delete api/service/deleteService
    //@ access - Admin
    const deleteService = handleErrorWrapper(async (req, res) => {
        const { serviceId } = req.body;  // Destructure serviceId from the request body
    console.log(req.body);
        // Ensure the serviceId is provided
        if (!serviceId) {
            return res.status(400).json({ message: 'Service ID is required' });
        }
        // Find the service and delete it
        const service = await Service.findOneAndDelete({ serviceId });

        // If service not found
        if (!service) {
            return res.status(404).json({ message: 'Service not found' });
        }

        // Respond with success message
        res.status(200).json({ message: 'Service deleted successfully', service });
    });






    module.exports={
        getAllServices,
        editAllServices,
        postNewService,
        deleteService,
    }