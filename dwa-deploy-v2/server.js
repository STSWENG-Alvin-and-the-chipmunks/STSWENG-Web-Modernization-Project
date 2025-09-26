/******************DEPENDENCIES************************/
const express = require('express');
const exphbs = require('express-handlebars');
const path = require('path');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser'); 
const fileUpload = require('express-fileupload');
const fs = require('fs');
const auth = require('./auth');
const app = express();
const port = process.env.PORT || 8000;

/******************SCHEMAS************************/
const User = require('./models/User');
const Promo = require('./models/Promo');
const Service = require('./models/Service');
const Branches = require('./models/Branches');
const Subscriber = require('./models/Subscriber');

/******************MIDDLEWARE************************/
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser()); 
app.use(fileUpload());

// Ensure the uploads directory exists
const uploadsDir = path.join(__dirname, 'public','uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

//HANDLEBARS SET-UP
const handlebars = exphbs.create({
    extname: 'hbs',
    defaultLayout: 'index',
    layoutsDir: path.join(__dirname, 'views', 'layouts'),
    partialsDir: path.join(__dirname, 'views', 'partials'),
    runtimeOptions: {
        allowProtoPropertiesByDefault: true,
        allowProtoMethodsByDefault: true,
    }
});

app.engine('hbs', handlebars.engine);
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

/******************DATABASE CONNECTION************************/
const connectDB = async () => {
    try {
        const uri = 'mongodb+srv://ae_db_user:We23K5110qLgvVMc@dwa-v2.w0xkabx.mongodb.net/?retryWrites=true&w=majority&appName=dwa-v2';
        
        await mongoose.connect(uri, {
        });
        console.log('Successfully connected to MongoDB Atlas');
    } catch (err) {
        console.error('Failed to connect to MongoDB Atlas:', err);
    }
};

connectDB();

/******************ROUTES************************/

/******************MAIN WEBPAGES************************/
app.get('/', async (req, res) => {
    try {
        const branches = await Branches.find();
        res.render('home', { title: 'Home', navTransparent: true, isLoginOrAdmin: false, isAdminPages: false, branches });
    } catch (err) {
        console.error('Error fetching branches:', err);
        res.status(500).send('Server error');
    }
});

app.get('/home', async (req, res) => {
    try {
        const branches = await Branches.find();
        res.render('home', { title: 'Home', navTransparent: true, isLoginOrAdmin: false, isAdminPages: false, branches });
    } catch (err) {
        console.error('Error fetching branches:', err);
        res.status(500).send('Server error');
    }
});

app.get('/about', async (req, res) => {
    try {
        const branches = await Branches.find();
        res.render('about', { title: 'About', navTransparent: false, isLoginOrAdmin: false, isAdminPages: false, branches });
    } catch (err) {
        console.error('Error fetching branches:', err);
        res.status(500).send('Server error');
    }
});

app.get('/promos', async (req, res) => {
    try {
        const branches = await Branches.find();
        const promos = await Promo.find();
        res.render('promos', { title: 'Promos', navTransparent: false, isLoginOrAdmin: false, isAdminPages: false, promos, branches });
    } catch (err) {
        console.error('Error fetching promos:', err);
        res.status(500).send('Server error');
    }
});

// Route to check if a promo name already exists
app.get('/promos/exists', async (req, res) => {
    const { name } = req.query;
    try {
        const promo = await Promo.findOne({ name });
        res.json(!!promo); // Return true if promo exists, false otherwise
    } catch (err) {
        console.error('Error checking promo name:', err);
        res.status(500).send('Server error');
    }
});

// Route to check if a branch name already exists
app.get('/branches/exists', async (req, res) => {
    const { branchName } = req.query;
    try {
        const branch = await Branches.findOne({ branchName });
        res.json(!!branch); // Return true if branch exists, false otherwise
    } catch (err) {
        console.error('Error checking branch name:', err);
        res.status(500).send('Server error');
    }
});

app.get('/newsletter', async (req, res) => {
    try {
        const branches = await Branches.find();
        res.render('newsletter', { title: 'Newsletter', navTransparent: false, isLoginOrAdmin: false, isAdminPages: false, branches });
    } catch (err) {
        console.error('Error fetching branches:', err);
        res.status(500).send('Server error');
    }
});

app.get('/services', async (req, res) => {
    try {
        const serviceType = req.query.type;
        let services = [];
        if (serviceType) {
            services = await Service.find({ serviceType: serviceType });
        } else {
            services = await Service.find();
        }
        console.log('Fetched Services:', services); // Log the fetched services
        const branches = await Branches.find(); 
        
        res.render('services', { title: 'Services', navTransparent: false, isLoginOrAdmin: false, isAdminPages: false, services, branches });
    } catch (err) {
        res.status(500).send('Server error');
    }
});

app.get('/branches', async (req, res) => {
    try {
        const branches = await Branches.find();
        res.render('branches', { title: 'Branches', navTransparent: false, isLoginOrAdmin: false, isAdminPages: false, branches });
    } catch (err) {
        console.error('Error fetching branches:', err);
        res.status(500).send('Server error');
    }
});

//FOR LOCATION NAVBAR
app.get('/branches/:branchName', async (req, res) => {
    try {
        console.log(`Fetching branch with name: ${req.params.branchName}`); 
        const branch = await Branches.findOne({ branchName: req.params.branchName });
        const branches = await Branches.find(); // Fetch all branches
        if (!branch) {
            console.log('Branch not found');
            return res.status(404).send('Branch not found');
        }
        console.log('Branch found:', branch);
        res.render('branches', { title: 'Branch', navTransparent: false, isLoginOrAdmin: false, isAdminPages: false, branch, branches });
    } catch (err) {
        console.error('Error fetching branch:', err);
        res.status(500).send('Server error');
    }
});

app.get('/login', async (req, res) => {
    try {
        const branches = await Branches.find();
        res.render('login', { title: 'Login', navTransparent: true, isLoginOrAdmin: true, isAdminPages: false, branches });
    } catch (err) {
        console.error('Error fetching branches:', err);
        res.status(500).send('Server error');
    }
});

app.get('/signup', async (req, res) => {
    try {
        const branches = await Branches.find();
        res.render('signup', { title: 'Sign Up', navTransparent: true, isLoginOrAdmin: true, isAdminPages: false, branches });
    } catch (err) {
        console.error('Error fetching branches:', err);
        res.status(500).send('Server error');
    }
});

/******************ADMIN WEBPAGES************************/
app.get('/admin-landing', auth, async (req, res) => {
    try {
        if (!req.user) {
            throw new Error('User not authenticated');
        }
        const branches = await Branches.find();
        const user = await User.findById(req.user.id);
        res.render('admin-landing', { title: 'Admin Landing Page', navTransparent: false, isLoginOrAdmin: true, isAdminPages: true, branches, user });
    } catch (err) {
        console.error('Error fetching branches:', err);
        res.status(500).send('Server error');
    }
});

app.get('/admin-promo', auth, async (req, res) => {
    try {
        const branches = await Branches.find();
        const promos = await Promo.find();
        const user = await User.findById(req.user.id);
        res.render('admin-promo', { title: 'Admin Promotions Page', navTransparent: false, isLoginOrAdmin: true, isAdminPages: true, promos, branches, user });
    } catch (err) {
        console.error('Error fetching promos:', err);
        res.status(500).send('Server error');
    }
});

app.get('/admin-services', auth, async (req, res) => {
    try {
        const branches = await Branches.find();
        const services = await Service.find();
        const user = await User.findById(req.user.id);
        res.render('admin-services', { title: 'Admin Services Page', navTransparent: false, isLoginOrAdmin: true, isAdminPages: true, services, branches, user });
    } catch (err) {
        console.error('Error fetching services:', err);
        res.status(500).send('Server error');
    }
});

app.get('/admin-branches', auth, async (req, res) => {
    try {
        const branches = await Branches.find();
        const user = await User.findById(req.user.id);
        res.render('admin-branches', { title: 'Admin Branches Page', navTransparent: false, isLoginOrAdmin: true, isAdminPages: true, branches, user });
    } catch (err) {
        console.error('Error fetching branches:', err);
        res.status(500).send('Server error');
    }
});

app.get('/admin-account', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).send('User not found');
        }
        res.render('admin-account', { title: 'Admin Account Page', navTransparent: false, isLoginOrAdmin: true, isAdminPages: true, user });
    } catch (err) {
        console.error('Error fetching user:', err);
        res.status(500).send('Server error');
    }
});

/******************FUNCTIONALITY************************/

/******************CRUD OPERATIONS************************/
//PROMOS
app.post('/promos', async (req, res) => {
    const { name, description, location, branches, contents, validity, pricingShort, pricingMedium, pricingLong, pricingExtraLong } = req.body;

    let imageUrl = '';
    if (req.files && req.files.promoImage) {
        const file = req.files.promoImage;
        const validImageTypes = ['image/jpeg', 'image/png', 'image/gif'];

        if (validImageTypes.includes(file.mimetype)) {
            const uploadPath = path.join(uploadsDir, file.name);

            // Log the file details for debugging
            console.log('File details:', file);

            // Move the file to the uploads directory
            await file.mv(uploadPath);

            // Assign the image URL
            imageUrl = `/uploads/${file.name}`;
        } else {
            return res.status(400).send('Invalid file type. Only JPEG, PNG, and GIF are allowed.');
        }
    } else {
        return res.status(400).send('Image is required');
    }

    const promoPricing = {
        short: pricingShort,
        medium: pricingMedium,
        long: pricingLong,
        extraLong: pricingExtraLong,
    };

    try {
        const newPromo = new Promo({ name, description, imageUrl, location, branches, contents, validity, pricing: promoPricing });
        await newPromo.save();
        res.redirect('/admin-promo');
    } catch (err) {
        console.error('Error creating promo:', err);
        res.status(500).send('Server error');
    }
});

app.get('/promos/:id', async (req, res) => {
    try {
        const promo = await Promo.findById(req.params.id);
        if (!promo) {
            return res.status(404).send('Promo not found');
        }
        res.json(promo);
    } catch (err) {
        console.error('Error fetching promo:', err);
        res.status(500).send('Server error');
    }
});

app.post('/promos/edit/:id', async (req, res) => {
    const { name, description, location, branches, contents, validity, pricingShort, pricingMedium, pricingLong, pricingExtraLong } = req.body;

    try {
        const existingPromo = await Promo.findById(req.params.id);

        if (!existingPromo) {
            return res.status(404).send('Promo not found');
        }

        const oldImagePath = existingPromo.imageUrl ? path.join(__dirname, 'public', existingPromo.imageUrl) : null;

        // Update fields only if they are provided in the request
        existingPromo.name = name || existingPromo.name;
        existingPromo.description = description || existingPromo.description;
        existingPromo.location = location || existingPromo.location;
        existingPromo.branches = branches || existingPromo.branches;
        existingPromo.contents = contents || existingPromo.contents;
        existingPromo.validity = validity || existingPromo.validity;

        // Update pricing fields only if they are provided
        existingPromo.pricing.short = pricingShort || existingPromo.pricing.short;
        existingPromo.pricing.medium = pricingMedium || existingPromo.pricing.medium;
        existingPromo.pricing.long = pricingLong || existingPromo.pricing.long;
        existingPromo.pricing.extraLong = pricingExtraLong || existingPromo.pricing.extraLong;

        // Check if a new file was uploaded
        if (req.files && req.files.promoImage) {
            const file = req.files.promoImage;
            const validImageTypes = ['image/jpeg', 'image/png', 'image/gif'];

            if (validImageTypes.includes(file.mimetype)) {
                const uploadPath = path.join(uploadsDir, file.name);

                // Move the file to the uploads directory
                await file.mv(uploadPath);

                // Assign the new image URL
                existingPromo.imageUrl = `/uploads/${file.name}`;

                // Delete the old image file if it exists
                if (oldImagePath) {
                    fs.unlink(oldImagePath, (err) => {
                        if (err) {
                            console.error('Error deleting old image:', err);
                        } else {
                            console.log('Old image deleted successfully');
                        }
                    });
                }
            } else {
                return res.status(400).send('Invalid file type. Only JPEG, PNG, and GIF are allowed.');
            }
        }

        // Save the updated promo document
        await existingPromo.save();
        res.redirect('/admin-promo');
    } catch (err) {
        console.error('Error updating promo:', err);
        res.status(500).send('Server error');
    }
});

app.post('/promos/delete/:id', async (req, res) => {
    try {
        const promo = await Promo.findById(req.params.id);

        if (!promo) {
            return res.status(404).json({ success: false, message: 'Promo not found' });
        }

        const oldImagePath = promo.imageUrl ? path.join(__dirname, 'public', promo.imageUrl) : null;

        await Promo.findByIdAndDelete(req.params.id);

        if (oldImagePath) {
            fs.unlink(oldImagePath, (err) => {
                if (err) {
                    console.error('Error deleting old image:', err);
                } else {
                    console.log('Old image deleted successfully');
                }
            });
        }

        res.json({ success: true });
    } catch (err) {
        console.error('Error deleting promo:', err);
        res.status(500).json({ success: false });
    }
});

//SERVICES
app.post('/services', async (req, res) => {
    const {
        serviceName, serviceType, serviceDescription,
        pricingShort = null, pricingMedium = null, pricingLong = null, pricingExtraLong = null,
        pricingMatrix = null, pricingElgon = null, pricingOrdeve = null, pricingNormal = null, 
        cutOffTime, branches
    } = req.body;

    const serviceTypeToUse = req.body.serviceType || req.body.serviceTypeDropdown;

    let serviceImages = [];
    const validImageTypes = ['image/jpeg', 'image/png', 'image/gif'];

    if (req.files && req.files.serviceImages) {
        const files = Array.isArray(req.files.serviceImages) ? req.files.serviceImages : [req.files.serviceImages];

        for (const file of files) {
            if (validImageTypes.includes(file.mimetype)) {
                const uploadPath = path.join(uploadsDir, file.name);
                await file.mv(uploadPath);
                serviceImages.push(`/uploads/${file.name}`);
            } else {
                return res.status(400).send('Invalid file type. Only JPEG, PNG, and GIF are allowed.');
            }
        }
    }

    if (!serviceName || !serviceTypeToUse || !serviceDescription || !cutOffTime || !branches) {
        return res.status(400).send('Missing required fields');
    }

    try {
        const newService = new Service({
            serviceName,
            serviceType: serviceTypeToUse,
            serviceDescription,
            serviceImages,
            pricing: {
                short: pricingShort,
                medium: pricingMedium,
                long: pricingLong,
                extraLong: pricingExtraLong,
                matrix: pricingMatrix,
                elgon: pricingElgon,
                ordeve: pricingOrdeve,
                normal: pricingNormal
            },
            cutOffTime,
            branches
        });
        await newService.save();
        res.redirect('/admin-services');
    } catch (err) {
        console.error('Error creating service:', err);
        res.status(500).send('Server error');
    }
});

app.get('/services/:id', async (req, res) => {
    try {
        const service = await Service.findById(req.params.id);
        res.json(service); 
    } catch (err) {
        console.error('Error fetching service:', err);
        res.status(500).send('Server error');
    }
});

app.post('/services/edit/:id', async (req, res) => {
    const {
        serviceName, serviceType, serviceDescription,
        pricingShort = null, pricingMedium = null, pricingLong = null, pricingExtraLong = null,
        pricingMatrix = null, pricingElgon = null, pricingOrdeve = null, pricingNormal = null, 
        cutOffTime, branches
    } = req.body;

    try {
        const existingService = await Service.findById(req.params.id);

        if (!existingService) {
            return res.status(404).send('Service not found');
        }

        const oldImagePaths = existingService.serviceImages.map(image => path.join(__dirname, 'public', image));

        let serviceImages = [];
        const validImageTypes = ['image/jpeg', 'image/png', 'image/gif'];

        if (req.files && req.files.serviceImages) {
            const files = Array.isArray(req.files.serviceImages) ? req.files.serviceImages : [req.files.serviceImages];

            for (const file of files) {
                if (validImageTypes.includes(file.mimetype)) {
                    const uploadPath = path.join(uploadsDir, file.name);
                    await file.mv(uploadPath);
                    serviceImages.push(`/uploads/${file.name}`);
                } else {
                    return res.status(400).send('Invalid file type. Only JPEG, PNG, and GIF are allowed.');
                }
            }

            // Delete old images if new ones are uploaded
            oldImagePaths.forEach(oldImagePath => {
                fs.unlink(oldImagePath, (err) => {
                    if (err) {
                        console.error('Error deleting old image:', err);
                    } else {
                        console.log('Old image deleted successfully');
                    }
                });
            });

            existingService.serviceImages = serviceImages;
        }

        // Update other fields
        existingService.serviceName = serviceName || existingService.serviceName;
        existingService.serviceType = serviceType || existingService.serviceType;
        existingService.serviceDescription = serviceDescription || existingService.serviceDescription;
        existingService.pricing.short = pricingShort || existingService.pricing.short;
        existingService.pricing.medium = pricingMedium || existingService.pricing.medium;
        existingService.pricing.long = pricingLong || existingService.pricing.long;
        existingService.pricing.extraLong = pricingExtraLong || existingService.pricing.extraLong;
        existingService.pricing.matrix = pricingMatrix || existingService.pricing.matrix;
        existingService.pricing.elgon = pricingElgon || existingService.pricing.elgon;
        existingService.pricing.ordeve = pricingOrdeve || existingService.pricing.ordeve;
        existingService.pricing.normal = pricingNormal || existingService.pricing.normal;
        existingService.cutOffTime = cutOffTime || existingService.cutOffTime;
        existingService.branches = branches || existingService.branches;

        await existingService.save();
        res.redirect('/admin-services');
    } catch (err) {
        console.error('Error updating service:', err);
        res.status(500).send('Server error');
    }
});

app.post('/services/delete/:id', async (req, res) => {
    try {
        const service = await Service.findById(req.params.id);

        if (!service) {
            return res.status(404).json({ success: false, message: 'Service not found' });
        }

        const oldImagePaths = service.serviceImages.map(image => path.join(__dirname, 'public', image));

        await Service.findByIdAndDelete(req.params.id);

        oldImagePaths.forEach(oldImagePath => {
            fs.unlink(oldImagePath, (err) => {
                if (err) {
                    console.error('Error deleting old image:', err);
                } else {
                    console.log('Old image deleted successfully');
                }
            });
        });

        res.json({ success: true });
    } catch (err) {
        console.error('Error deleting service:', err);
        res.status(500).json({ success: false });
    }
});

//BRANCHES
app.post('/branches', async (req, res) => {
    const { branchName, branchLocation, branchDescription, branchAdditionalDescription, operatingHours, mobileNumbers, landLineNumbers, fbLink, numberOfStations, maxClientOccupancy, restroom, wifi, parkingLocation } = req.body;
    let locationImageUrl = '';
    const validImageTypes = ['image/jpeg', 'image/png', 'image/gif'];

    if (req.files && req.files.locationImage) {
        const file = req.files.locationImage;

        if (validImageTypes.includes(file.mimetype)) {
            const uploadPath = path.join(uploadsDir, file.name);

            try {
                await file.mv(uploadPath);
                locationImageUrl = `/uploads/${file.name}`;
            } catch (err) {
                console.error('Error saving location image:', err);
                return res.status(500).send('Error saving location image');
            }
        } else {
            return res.status(400).send('Invalid file type. Only JPEG, PNG, and GIF are allowed.');
        }
    }

    try {
        const newBranch = new Branches({
            branchName,
            branchLocation,
            branchDescription,
            branchAdditionalDescription,
            locationImage: locationImageUrl, 
            operatingHours,
            mobileNumbers,
            landLineNumbers,
            fbLink,
            numberOfStations,
            maxClientOccupancy,
            restroom,
            wifi,
            parkingLocation
        });
        await newBranch.save();
        res.redirect('/admin-branches');
    } catch (err) {
        console.error('Error creating branch:', err);
        res.status(500).send('Server error');
    }
});

app.get('/admin-branches/:id', async (req, res) => {
    try {
        const branch = await Branches.findById(req.params.id);
        res.json(branch); 
    } catch (err) {
        console.error('Error fetching branch:', err);
        res.status(500).send('Server error');
    }
});

app.post('/branches/edit/:id', async (req, res) => {
    const { branchName, branchLocation, branchDescription, branchAdditionalDescription, operatingHours, mobileNumbers, landLineNumbers, fbLink, numberOfStations, maxClientOccupancy, restroom, wifi, parkingLocation } = req.body;

    try {
        const existingBranch = await Branches.findById(req.params.id);

        if (!existingBranch) {
            return res.status(404).send('Branch not found');
        }

        const oldImagePath = existingBranch.locationImage ? path.join(__dirname, 'public', existingBranch.locationImage) : null;
        const validImageTypes = ['image/jpeg', 'image/png', 'image/gif'];

        if (req.files && req.files.locationImage) {
            const file = req.files.locationImage;

            if (validImageTypes.includes(file.mimetype)) {
                const uploadPath = path.join(uploadsDir, file.name);

                try {
                    await file.mv(uploadPath);
                    existingBranch.locationImage = `/uploads/${file.name}`;

                    // Delete the old image file if it exists
                    if (oldImagePath) {
                        fs.unlink(oldImagePath, (err) => {
                            if (err) {
                                console.error('Error deleting old image:', err);
                            } else {
                                console.log('Old image deleted successfully');
                            }
                        });
                    }
                } catch (err) {
                    console.error('Error uploading image:', err);
                    return res.status(500).send('Server error');
                }
            } else {
                return res.status(400).send('Invalid file type. Only JPEG, PNG, and GIF are allowed.');
            }
        }

        // Update other fields
        existingBranch.branchName = branchName || existingBranch.branchName;
        existingBranch.branchLocation = branchLocation || existingBranch.branchLocation;
        existingBranch.branchDescription = branchDescription || existingBranch.branchDescription;
        existingBranch.branchAdditionalDescription = branchAdditionalDescription || existingBranch.branchAdditionalDescription;
        existingBranch.operatingHours = operatingHours || existingBranch.operatingHours;
        existingBranch.mobileNumbers = mobileNumbers || existingBranch.mobileNumbers;
        existingBranch.landLineNumbers = landLineNumbers || existingBranch.landLineNumbers;
        existingBranch.fbLink = fbLink || existingBranch.fbLink;
        existingBranch.numberOfStations = numberOfStations || existingBranch.numberOfStations;
        existingBranch.maxClientOccupancy = maxClientOccupancy || existingBranch.maxClientOccupancy;
        existingBranch.restroom = restroom || existingBranch.restroom;
        existingBranch.wifi = wifi || existingBranch.wifi;
        existingBranch.parkingLocation = parkingLocation || existingBranch.parkingLocation;

        await existingBranch.save();
        res.redirect('/admin-branches');
    } catch (err) {
        console.error('Error updating branch:', err);
        res.status(500).send('Server error');
    }
});

app.post('/branches/delete/:id', async (req, res) => {
    try {
        const branch = await Branches.findById(req.params.id);

        if (!branch) {
            return res.status(404).json({ success: false, message: 'Branch not found' });
        }

        const oldImagePath = branch.locationImage ? path.join(__dirname, 'public', branch.locationImage) : null;

        await Branches.findByIdAndDelete(req.params.id);

        if (oldImagePath) {
            fs.unlink(oldImagePath, (err) => {
                if (err) {
                    console.error('Error deleting old image:', err);
                } else {
                    console.log('Old image deleted successfully');
                }
            });
        }

        res.json({ success: true });
    } catch (err) {
        console.error('Error deleting branch:', err);
        res.status(500).json({ success: false });
    }
});

/******************OTHERS************************/
// REGISTER USER
app.post('/signup', async (req, res) => {
    const { username, email, password } = req.body;

    try {
        let user = await User.findOne({ $or: [{ username }, { email }] });
        if (user) {
            return res.render('signup', { 
                title: 'Sign Up', 
                navTransparent: true, 
                isLoginOrAdmin: true, 
                isAdminPages: false,
                errorMessage: 'Username or Email already exists'
            });
        }

        user = new User({
            username,
            email,
            password
        });

        // Hash password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);

        await user.save();

        res.render('login', { 
            title: 'Login', 
            navTransparent: true, 
            isLoginOrAdmin: true, 
            isAdminPages: false,
            successMessage: 'User was Successfully Registered' 
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

//LOGIN USER
app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await User.findOne({ username });
        if (!user) {
            return res.render('login', { 
                title: 'Login', 
                navTransparent: false, 
                isLoginOrAdmin: true, 
                isAdminPages: false,
                errorMessage: 'Invalid Username or Password'
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.render('login', { 
                title: 'Login', 
                navTransparent: false, 
                isLoginOrAdmin: true, 
                isAdminPages: false,
                errorMessage: 'Invalid Username or Password'
            });
        }

        // Generate JWT
        const payload = {
            user: {
                id: user.id
            }
        };

        jwt.sign(
            payload,
            'your_jwt_secret_here',
            { expiresIn: 3600 },
            (err, token) => {
                if (err) throw err;
                res.cookie('token', token, { httpOnly: true });
                res.redirect('/admin-landing');  // Redirect to admin landing page after successful login
            }
        );
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// NEWSLETTER FORM SUBMITION
app.post('/submit-form', async (req, res) => {
    const { email, firstName, lastName, city } = req.body;
    try {
        const newSubscriber = new Subscriber({
            email,
            firstName,
            lastName,
            city
        });
        await newSubscriber.save();
        console.log('Subscriber saved successfully!');
        res.status(201).send('Form submitted successfully!');
    } catch (err) {
        console.error('Failed to save subscriber:', err);
        res.status(500).send('Server error');
    }
});

//UPDATE ADMIN ACCOUNT
app.post('/admin-account/upload-profile-pic', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        if (req.files && req.files.profilePic) {
            const profilePic = req.files.profilePic;
            const validImageTypes = ['image/jpeg', 'image/png', 'image/gif'];

            if (!validImageTypes.includes(profilePic.mimetype)) {
                return res.status(400).json({ success: false, message: 'Invalid file type. Only JPEG, PNG, and GIF are allowed.' });
            }

            const profilePicName = `${user.username}-pfp.png`;
            const profilePicPath = `/profile_pics/${profilePicName}`;

            profilePic.mv(path.join(__dirname, 'public', profilePicPath), async (err) => {
                if (err) {
                    console.error('Error saving profile picture:', err);
                    return res.status(500).json({ success: false, message: 'Error saving file' });
                }

                user.profilePic = profilePicPath;
                await user.save();
                return res.json({ success: true, message: 'Profile picture updated successfully' });
            });
        } else {
            return res.status(400).json({ success: false, message: 'No profile picture uploaded' });
        }
    } catch (error) {
        console.error('Error in /admin-account/upload-profile-pic route:', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
});

app.post('/admin-account', auth, async (req, res) => {
    try {
        const { username, email, newPassword, confirmPassword } = req.body;
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        if (!username || !email) {
            return res.status(400).json({ success: false, message: 'Username and email are required' });
        }

        user.username = username;
        user.email = email;

        if (newPassword && newPassword === confirmPassword) {
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(newPassword, salt);
        } else if (newPassword && newPassword !== confirmPassword) {
            return res.status(400).json({ success: false, message: 'Passwords do not match' });
        }

        await user.save();
        return res.redirect('/admin-account?success=true');
    } catch (error) {
        console.error('Error in /admin-account route:', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
});

// Protected Route 
app.get('/protected', auth, (req, res) => {
    res.render('protected', { title: 'Protected', user: req.user });
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});


