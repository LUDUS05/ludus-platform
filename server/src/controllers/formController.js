const Form = require('../models/Form');
const FormResponse = require('../models/FormResponse');
const { validationResult } = require('express-validator');
const fs = require('fs').promises;
const path = require('path');
const csv = require('csv-writer').createObjectCsvWriter;

// @desc    Get all forms (Admin)
// @route   GET /api/admin/forms
// @access  Private (Admin)
const getAllForms = async (req, res) => {
  try {
    const { status, page = 1, limit = 10, search } = req.query;
    
    const query = {};
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { slug: { $regex: search, $options: 'i' } }
      ];
    }
    
    const forms = await Form.find(query)
      .populate('createdBy', 'firstName lastName email')
      .populate('lastModifiedBy', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await Form.countDocuments(query);
    
    res.json({
      success: true,
      data: {
        forms,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
  } catch (error) {
    console.error('Get all forms error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch forms'
    });
  }
};

// @desc    Get single form
// @route   GET /api/admin/forms/:id
// @access  Private (Admin)
const getForm = async (req, res) => {
  try {
    const form = await Form.findById(req.params.id)
      .populate('createdBy', 'firstName lastName email')
      .populate('lastModifiedBy', 'firstName lastName email');
    
    if (!form) {
      return res.status(404).json({
        success: false,
        message: 'Form not found'
      });
    }
    
    res.json({
      success: true,
      data: { form }
    });
  } catch (error) {
    console.error('Get form error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch form'
    });
  }
};

// @desc    Create new form
// @route   POST /api/admin/forms
// @access  Private (Admin)
const createForm = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errors.array()
      });
    }
    
    const formData = {
      ...req.body,
      createdBy: req.user.id,
      lastModifiedBy: req.user.id
    };
    
    // Ensure fields have proper order
    if (formData.fields && formData.fields.length > 0) {
      formData.fields = formData.fields.map((field, index) => ({
        ...field,
        order: field.order || index
      }));
    }
    
    const form = await Form.create(formData);
    
    res.status(201).json({
      success: true,
      message: 'Form created successfully',
      data: { form }
    });
  } catch (error) {
    console.error('Create form error:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Form slug already exists'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to create form'
    });
  }
};

// @desc    Update form
// @route   PUT /api/admin/forms/:id
// @access  Private (Admin)
const updateForm = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errors.array()
      });
    }
    
    const form = await Form.findById(req.params.id);
    if (!form) {
      return res.status(404).json({
        success: false,
        message: 'Form not found'
      });
    }
    
    const updateData = {
      ...req.body,
      lastModifiedBy: req.user.id
    };
    
    // If publishing for the first time, set publishedAt
    if (updateData.status === 'published' && form.status !== 'published') {
      updateData.publishedAt = new Date();
    }
    
    // Ensure fields have proper order
    if (updateData.fields && updateData.fields.length > 0) {
      updateData.fields = updateData.fields.map((field, index) => ({
        ...field,
        order: field.order || index
      }));
    }
    
    const updatedForm = await Form.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('createdBy', 'firstName lastName email')
     .populate('lastModifiedBy', 'firstName lastName email');
    
    res.json({
      success: true,
      message: 'Form updated successfully',
      data: { form: updatedForm }
    });
  } catch (error) {
    console.error('Update form error:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Form slug already exists'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to update form'
    });
  }
};

// @desc    Delete form
// @route   DELETE /api/admin/forms/:id
// @access  Private (Admin)
const deleteForm = async (req, res) => {
  try {
    const form = await Form.findById(req.params.id);
    if (!form) {
      return res.status(404).json({
        success: false,
        message: 'Form not found'
      });
    }
    
    // Check if form has responses
    const responseCount = await FormResponse.countDocuments({ form: req.params.id });
    if (responseCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete form with ${responseCount} responses. Archive the form instead.`
      });
    }
    
    await Form.findByIdAndDelete(req.params.id);
    
    res.json({
      success: true,
      message: 'Form deleted successfully'
    });
  } catch (error) {
    console.error('Delete form error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete form'
    });
  }
};

// @desc    Get form responses
// @route   GET /api/admin/forms/:id/responses
// @access  Private (Admin)
const getFormResponses = async (req, res) => {
  try {
    const { status, page = 1, limit = 20, dateFrom, dateTo } = req.query;
    
    const form = await Form.findById(req.params.id);
    if (!form) {
      return res.status(404).json({
        success: false,
        message: 'Form not found'
      });
    }
    
    const options = {
      status,
      dateFrom,
      dateTo,
      limit: parseInt(limit),
      skip: (parseInt(page) - 1) * parseInt(limit)
    };
    
    const responses = await FormResponse.getResponsesByForm(req.params.id, options);
    const total = await FormResponse.countDocuments({ form: req.params.id });
    
    res.json({
      success: true,
      data: {
        responses,
        form: {
          id: form._id,
          title: form.title,
          slug: form.slug
        },
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
  } catch (error) {
    console.error('Get form responses error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch form responses'
    });
  }
};

// @desc    Get form response statistics
// @route   GET /api/admin/forms/:id/stats
// @access  Private (Admin)
const getFormStats = async (req, res) => {
  try {
    const form = await Form.findById(req.params.id);
    if (!form) {
      return res.status(404).json({
        success: false,
        message: 'Form not found'
      });
    }
    
    const stats = await FormResponse.getResponseStats(req.params.id);
    const fieldStats = await FormResponse.aggregate([
      { $match: { form: form._id } },
      { $unwind: '$responses' },
      {
        $group: {
          _id: '$responses.fieldId',
          fieldLabel: { $first: '$responses.fieldLabel' },
          fieldType: { $first: '$responses.fieldType' },
          responseCount: { $sum: 1 },
          uniqueValues: { $addToSet: '$responses.value' }
        }
      },
      { $sort: { responseCount: -1 } }
    ]);
    
    res.json({
      success: true,
      data: {
        form: {
          id: form._id,
          title: form.title,
          slug: form.slug
        },
        stats: stats[0] || {
          totalResponses: 0,
          reviewedResponses: 0,
          pendingResponses: 0,
          averageSubmissionTime: 0
        },
        fieldStats
      }
    });
  } catch (error) {
    console.error('Get form stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch form statistics'
    });
  }
};

// @desc    Update response status
// @route   PUT /api/admin/forms/responses/:id
// @access  Private (Admin)
const updateResponseStatus = async (req, res) => {
  try {
    const { status, reviewNotes } = req.body;
    
    const response = await FormResponse.findById(req.params.id);
    if (!response) {
      return res.status(404).json({
        success: false,
        message: 'Response not found'
      });
    }
    
    const updateData = {
      status,
      reviewedBy: req.user.id,
      reviewedAt: new Date()
    };
    
    if (reviewNotes) {
      updateData.reviewNotes = reviewNotes;
    }
    
    const updatedResponse = await FormResponse.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).populate('reviewedBy', 'firstName lastName email');
    
    res.json({
      success: true,
      message: 'Response status updated successfully',
      data: { response: updatedResponse }
    });
  } catch (error) {
    console.error('Update response status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update response status'
    });
  }
};

// @desc    Export form responses as CSV
// @route   GET /api/admin/forms/:id/export
// @access  Private (Admin)
const exportFormResponses = async (req, res) => {
  try {
    const { format = 'csv', status, dateFrom, dateTo } = req.query;
    
    const form = await Form.findById(req.params.id);
    if (!form) {
      return res.status(404).json({
        success: false,
        message: 'Form not found'
      });
    }
    
    const options = { status, dateFrom, dateTo };
    const responses = await FormResponse.getResponsesByForm(req.params.id, options);
    
    if (format === 'csv') {
      // Generate CSV
      const csvData = responses.map(response => response.toCSVRow());
      
      if (csvData.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No responses to export'
        });
      }
      
      const headers = Object.keys(csvData[0]);
      const csvContent = [
        headers.join(','),
        ...csvData.map(row => 
          headers.map(header => {
            const value = row[header] || '';
            // Escape CSV values
            return `"${value.toString().replace(/"/g, '""')}"`;
          }).join(',')
        )
      ].join('\n');
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${form.slug}-responses-${new Date().toISOString().split('T')[0]}.csv"`);
      res.send(csvContent);
    } else {
      // Return JSON format
      res.json({
        success: true,
        data: {
          form: {
            id: form._id,
            title: form.title,
            slug: form.slug
          },
          responses: csvData,
          exportedAt: new Date().toISOString(),
          totalResponses: responses.length
        }
      });
    }
  } catch (error) {
    console.error('Export form responses error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export form responses'
    });
  }
};

// @desc    Submit form response (Public)
// @route   POST /api/forms/:slug/submit
// @access  Public
const submitFormResponse = async (req, res) => {
  try {
    const { slug } = req.params;
    const { responses, metadata = {} } = req.body;
    
    const form = await Form.findOne({ slug, status: 'published' });
    if (!form) {
      return res.status(404).json({
        success: false,
        message: 'Form not found or not published'
      });
    }
    
    // Check if multiple submissions are allowed
    if (!form.settings.allowMultipleSubmissions && req.user) {
      const existingResponse = await FormResponse.findOne({
        form: form._id,
        submittedBy: req.user.id
      });
      
      if (existingResponse) {
        return res.status(400).json({
          success: false,
          message: 'You have already submitted this form'
        });
      }
    }
    
    // Validate responses against form fields
    const validatedResponses = [];
    for (const field of form.fields) {
      const response = responses.find(r => r.fieldId === field.id);
      
      if (field.required && (!response || !response.value)) {
        return res.status(400).json({
          success: false,
          message: `Field "${field.label}" is required`
        });
      }
      
      if (response && response.value) {
        // Basic validation
        if (field.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(response.value)) {
          return res.status(400).json({
            success: false,
            message: `Invalid email format for field "${field.label}"`
          });
        }
        
        if (field.type === 'number' && isNaN(response.value)) {
          return res.status(400).json({
            success: false,
            message: `Invalid number format for field "${field.label}"`
          });
        }
        
        validatedResponses.push({
          fieldId: field.id,
          fieldType: field.type,
          fieldLabel: field.label,
          value: response.value,
          files: response.files || []
        });
      }
    }
    
    // Create form response
    const formResponse = await FormResponse.create({
      form: form._id,
      formSlug: form.slug,
      formTitle: form.title,
      responses: validatedResponses,
      submittedBy: req.user ? req.user.id : null,
      submitterInfo: {
        name: req.user ? `${req.user.firstName} ${req.user.lastName}` : metadata.name || 'Anonymous',
        email: req.user ? req.user.email : metadata.email || '',
        ip: req.ip,
        userAgent: req.get('User-Agent')
      },
      metadata: {
        submissionTime: metadata.submissionTime || 0,
        referrer: req.get('Referer'),
        source: metadata.source || 'web'
      }
    });
    
    // Update form response count
    await Form.findByIdAndUpdate(form._id, {
      $inc: { responseCount: 1 }
    });
    
    res.status(201).json({
      success: true,
      message: form.settings.successMessage,
      data: {
        responseId: formResponse._id,
        redirectUrl: form.settings.redirectUrl
      }
    });
  } catch (error) {
    console.error('Submit form response error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit form response'
    });
  }
};

// @desc    Get published form by slug
// @route   GET /api/forms/:slug
// @access  Public
const getPublishedForm = async (req, res) => {
  try {
    const form = await Form.findOne({ 
      slug: req.params.slug, 
      status: 'published' 
    });
    
    if (!form) {
      return res.status(404).json({
        success: false,
        message: 'Form not found'
      });
    }
    
    res.json({
      success: true,
      data: { form }
    });
  } catch (error) {
    console.error('Get published form error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch form'
    });
  }
};

module.exports = {
  getAllForms,
  getForm,
  createForm,
  updateForm,
  deleteForm,
  getFormResponses,
  getFormStats,
  updateResponseStatus,
  exportFormResponses,
  submitFormResponse,
  getPublishedForm
};
