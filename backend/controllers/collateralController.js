import { getGoldValue, getPropertyValue } from '../services/valuationService.js';
import Collateral from '../models/Collateral.js';

export const createCollateral = async (req, res) => {
  try {
    const { type, goldAmount, city, area, areaUnit } = req.body;

    console.log(req.body);

    let currentValue;

    if (type === 'property') {
      if (!city || !area) {
        return res.status(400).json({ error: 'City and area are required for property valuation' });
      }
      currentValue = await getPropertyValue(city, area);
    } else if (type === 'gold') {
      if (!goldAmount) {
        return res.status(400).json({ error: 'Gold amount is required for gold valuation' });
      }
      currentValue = await getGoldValue(goldAmount);
    } else {
      return res.status(400).json({ error: 'Invalid collateral type' });
    }

    // Prepare collateral data
    const collateralData = {
      owner: req.user.id,
      type,
      value: currentValue,
      status: 'pending', // Default status
    };

    // Handle property documents if provided
    if (req.file) {
      collateralData.documents = [{ 
        filename: req.file.originalname, 
        uploadDate: new Date() 
      }];
    }

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




export const getMyCollaterals = async (req, res) => {
  try {
    const collaterals = await Collateral.find({ owner: req.user.id })
      .populate('loanAssociation', 'status amount term')
      .sort('-createdAt');

    res.json(collaterals);
  } catch (error) {
    res.status(500).json({
      error: 'Error fetching collaterals',
      message: error.message
    });
  }
};

export const getCollateralDetails = async (req, res) => {
  try {
    const collateral = await Collateral.findById(req.params.id)
      .populate('owner', 'firstName lastName email')
      .populate('loanAssociation');

    if (!collateral) {
      return res.status(404).json({
        error: 'Collateral not found'
      });
    }

    // Check authorization
    if (collateral.owner._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        error: 'Not authorized to view this collateral'
      });
    }

    res.json(collateral);
  } catch (error) {
    res.status(500).json({
      error: 'Error fetching collateral details',
      message: error.message
    });
  }
};

export const updateCollateral = async (req, res) => {
  try {
    const collateral = await Collateral.findById(req.params.id);

    if (!collateral) {
      return res.status(404).json({
        error: 'Collateral not found'
      });
    }

    // Check ownership
    if (collateral.owner.toString() !== req.user.id) {
      return res.status(403).json({
        error: 'Not authorized to update this collateral'
      });
    }

    // Check if collateral can be updated
    if (collateral.status !== 'pending' && collateral.status !== 'rejected') {
      return res.status(400).json({
        error: 'Collateral cannot be updated in its current status'
      });
    }

    const {
      description,
      value,
      location,
      documents
    } = req.body;

    // Update fields
    if (description) collateral.description = description;
    if (value) {
      collateral.value = {
        ...collateral.value,
        ...value,
        lastValuationDate: new Date()
      };
    }
    if (location) collateral.location = location;
    if (documents) {
      collateral.documents = [
        ...collateral.documents,
        ...documents.map(doc => ({
          ...doc,
          uploadDate: new Date()
        }))
      ];
    }

    await collateral.save();

    res.json({
      collateral,
      message: 'Collateral updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      error: 'Error updating collateral',
      message: error.message
    });
  }
};

export const verifyCollateral = async (req, res) => {
  try {
    const collateral = await Collateral.findById(req.params.id);

    if (!collateral) {
      return res.status(404).json({
        error: 'Collateral not found'
      });
    }

    if (collateral.status !== 'pending') {
      return res.status(400).json({
        error: 'Collateral is not in pending status'
      });
    }

    const { verificationStatus, notes } = req.body;

    collateral.status = verificationStatus === 'approved' ? 'verified' : 'rejected';
    collateral.verificationDetails = {
      verifiedBy: req.user.id,
      verificationDate: new Date(),
      notes
    };

    await collateral.save();

    res.json({
      collateral,
      message: `Collateral ${verificationStatus} successfully`
    });
  } catch (error) {
    res.status(500).json({
      error: 'Error verifying collateral',
      message: error.message
    });
  }
}; 