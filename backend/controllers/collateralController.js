import { getGoldValue, getPropertyValue } from '../services/valuationService.js';
import Collateral from '../models/Collateral.js';

export const createCollateral = async (req, res) => {
  try {
    const { type, goldAmount, cityName, area } = req.body;

    console.log(req.body);

    let currentValue;

    if (type === 'property') {
      if (!cityName || !area) {
        return res.status(400).json({ error: 'City and area are required for property valuation' });
      }
      currentValue = await getPropertyValue(cityName, area);
    } else if (type === 'gold') {
      if (!goldAmount) {
        return res.status(400).json({ error: 'Gold amount is required for gold valuation' });
      }
      currentValue = await getGoldValue(goldAmount);
    } else {
      return res.status(400).json({ error: 'Invalid collateral type' });
    }

    const collateralData = {
      owner: req.user.id,
      type,
      value: currentValue,
      status: 'unlocked',
    };
    console.log(collateralData);

    const collateral = await Collateral.create(collateralData);

    res.status(201).json({
      collateral,
      message: 'Collateral created successfully',
    });
  } catch (error) {
    res.status(500).json({
      error: 'Error creating collateral',
      message: error.message,
    });
  }
};

export const removeCollateral = async(req, res) => {
  try {
    const {id} = req.params;
    const collateral = await Collateral.findById(id);

    if(!collateral){
      return res.status(404).json({error: "Collateral not found!"});
    }
    if(collateral.owner.toString() !== req.user.id){
      return res.status(403).json({error: "You are not a owner of this Collateral!"})
    }

    await collateral.findByIdAndDelete(id);

    return res.status(200).json({message: "Collateral removed successfully!"});
  } catch (error) {
    return res.status(500).json({error: "Error removing collateral", message: error.message})
  }
}

export const getMyCollaterals = async (req, res) => {
  try {
    const collaterals = await Collateral.find({ owner: req.user.id })
      .sort('-createdAt');
    res.json(collaterals);
  } catch (error) {
    res.status(500).json({
      error: 'Error fetching collaterals',
      message: error.message,
    });
  }
};

export const getCollateralDetails = async (req, res) => {
  try {
    const collateral = await Collateral.findById(req.params.id)

    if (!collateral) {
      return res.status(404).json({ error: 'Collateral not found' });
    }

    if (collateral.owner._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to view this collateral' });
    }

    res.json(collateral);
  } catch (error) {
    res.status(500).json({
      error: 'Error fetching collateral details',
      message: error.message,
    });
  }
};

