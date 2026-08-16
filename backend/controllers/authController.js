import jwt from 'jsonwebtoken';
import Owner from '../models/Owner.js';
import Mess from '../models/Mess.js';

const generateToken = (user) => {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

const formatUser = (user, token) => ({
  _id: user._id,
  role: user.role,
  email: user.email,
  phone: user.phone,
  address: user.address,
  businessName: user.businessName,
  ownerName: user.ownerName,
  fullName: user.fullName,
  token,
});

export const registerOwner = async (req, res) => {
  try {
    const { businessName, ownerName, email, phone, password, address, messName, location, description } = req.body;

    if (!businessName || !ownerName || !email || !password) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    const exists = await Owner.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: 'Account already exists with this email' });
    }

    const owner = await Owner.create({
      role: 'OWNER',
      businessName,
      ownerName,
      email,
      phone,
      password,
      address,
    });

    const mess = await Mess.create({
      ownerId: owner._id,
      name: messName || businessName,
      location,
      address,
      description,
      contact: phone,
      mealTypes: ['Lunch', 'Dinner'],
    });

    res.status(201).json({
      ...formatUser(owner, generateToken(owner)),
      mess,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const registerCustomer = async (req, res) => {
  try {
    const { fullName, email, phone, password, address } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    const exists = await Owner.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: 'Account already exists with this email' });
    }

    const customer = await Owner.create({
      role: 'CUSTOMER',
      fullName,
      email,
      phone,
      password,
      address,
    });

    res.status(201).json(formatUser(customer, generateToken(customer)));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    const filter = { email };
    if (role) filter.role = role;

    const user = await Owner.findOne(filter);
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const payload = formatUser(user, generateToken(user));

    if (user.role === 'OWNER') {
      payload.mess = await Mess.findOne({ ownerId: user._id });
    }

    res.json(payload);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMe = async (req, res) => {
  const payload = req.user.toObject();
  delete payload.password;

  if (req.user.role === 'OWNER') {
    payload.mess = await Mess.findOne({ ownerId: req.user._id });
  }

  res.json(payload);
};

// Backward compatible owner register
export const register = registerOwner;
