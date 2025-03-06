import Collateral from '../models/Collateral.js';
import { getCollateralValue } from '../services/valuationService.js';

export const createCollateral = async (req, res) => {
  try {
    const {
      type,
      description,
      value,
      location,
      documents
    } = req.body;

    // Fetch the current value of the collateral
    const currentValue = await getCollateralValue(type, value.amount);

    const collateral = await Collateral.create({
      owner: req.user.id,
      type,
      description,
      value: {
        amount: currentValue,
        currency: value.currency,
        lastValuationDate: new Date()
      },
      location,
      documents: documents.map(doc => ({
        ...doc,
        uploadDate: new Date()
      }))
    });

    res.status(201).json({
      collateral,
      message: 'Collateral created successfully'
    });
  } catch (error) {
    res.status(500).json({
      error: 'Error creating collateral',
      message: error.message
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