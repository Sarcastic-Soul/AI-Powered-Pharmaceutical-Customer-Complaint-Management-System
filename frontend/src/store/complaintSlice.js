import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const DEFAULT_FORM = {
  customer_name: '',
  customer_email: '',
  company_site: '',
  product_name: '',
  product_type: 'FDF',
  dosage_form: '',
  batch_number: '',
  mfg_date: '',
  expiry_date: '',
  defect_type: 'Quality Defect',
  defect_category: '',
  defect_description: '',
  storage_conditions: '',
  sample_available: false,
  sample_condition: '',
  severity_level: 'Major',
  regulatory_reportable: false,
  health_hazard_risk: 'Medium',
  investigation_status: 'Logged'
};

export const fetchComplaints = createAsyncThunk(
  'complaint/fetchComplaints',
  async () => {
    const res = await fetch('/api/complaints');
    return await res.json();
  }
);

export const extractFieldsFromText = createAsyncThunk(
  'complaint/extractFieldsFromText',
  async ({ text, groqApiKey }) => {
    const res = await fetch('/api/ai/extract', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, groq_api_key: groqApiKey })
    });
    return await res.json();
  }
);

export const uploadAndExtractFile = createAsyncThunk(
  'complaint/uploadAndExtractFile',
  async ({ file }) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch('/api/ai/extract-file', {
      method: 'POST',
      body: formData
    });
    return await res.json();
  }
);

export const sendNLChatMessage = createAsyncThunk(
  'complaint/sendNLChatMessage',
  async ({ message, currentForm, groqApiKey }) => {
    const res = await fetch('/api/ai/chat-edit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message,
        current_form_data: currentForm,
        groq_api_key: groqApiKey
      })
    });
    return await res.json();
  }
);

export const runFullQMSAnalysis = createAsyncThunk(
  'complaint/runFullQMSAnalysis',
  async ({ form, groqApiKey }) => {
    const res = await fetch('/api/ai/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        form_data: form,
        groq_api_key: groqApiKey
      })
    });
    return await res.json();
  }
);

export const saveComplaintToDb = createAsyncThunk(
  'complaint/saveComplaintToDb',
  async (formData) => {
    const res = await fetch('/api/complaints', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    return await res.json();
  }
);

const complaintSlice = createSlice({
  name: 'complaint',
  initialState: {
    activeForm: { ...DEFAULT_FORM },
    highlightedFields: [],
    rawLogText: '',
    completeness: { score_percentage: 0, missing_fields: [] },
    riskAnalysis: null,
    rcaCapa: null,
    duplicates: [],
    savedComplaints: [],
    chatHistory: [
      {
        sender: 'ai',
        text: 'Hello! I am your AI QMS Assistant. Paste a complaint log above or chat with me to edit form fields dynamically (e.g. "Set batch to B-8891 and severity to Critical").',
        timestamp: new Date().toLocaleTimeString()
      }
    ],
    groqApiKey: localStorage.getItem('GROQ_API_KEY') || '',
    activeTab: 'logger', // 'logger', 'database', 'audit', 'analytics'
    isChatDrawerOpen: false, // Default closed so main workspace is clean!
    isExtracting: false,
    isAnalyzing: false,
    isSaving: false,
    statusMessage: null
  },
  reducers: {
    updateFormField: (state, action) => {
      const { field, value } = action.payload;
      state.activeForm[field] = value;
    },
    setFullForm: (state, action) => {
      state.activeForm = { ...state.activeForm, ...action.payload };
    },
    resetForm: (state) => {
      state.activeForm = { ...DEFAULT_FORM };
      state.highlightedFields = [];
      state.rawLogText = '';
      state.completeness = { score_percentage: 0, missing_fields: [] };
      state.riskAnalysis = null;
      state.rcaCapa = null;
      state.duplicates = [];
      state.statusMessage = null;
    },
    setGroqApiKey: (state, action) => {
      state.groqApiKey = action.payload;
      localStorage.setItem('GROQ_API_KEY', action.payload);
    },
    setActiveTab: (state, action) => {
      state.activeTab = action.payload;
    },
    toggleChatDrawer: (state) => {
      state.isChatDrawerOpen = !state.isChatDrawerOpen;
    },
    clearHighlightedFields: (state) => {
      state.highlightedFields = [];
    },
    setRawLogText: (state, action) => {
      state.rawLogText = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchComplaints.fulfilled, (state, action) => {
        state.savedComplaints = action.payload;
      })
      .addCase(extractFieldsFromText.pending, (state) => {
        state.isExtracting = true;
      })
      .addCase(extractFieldsFromText.fulfilled, (state, action) => {
        state.isExtracting = false;
        if (action.payload.form_data) {
          state.activeForm = { ...state.activeForm, ...action.payload.form_data };
          state.highlightedFields = Object.keys(action.payload.form_data);
        }
        state.completeness = action.payload.completeness || state.completeness;
        state.riskAnalysis = action.payload.risk_analysis || state.riskAnalysis;
        state.rcaCapa = action.payload.rca_capa || state.rcaCapa;
        state.duplicates = action.payload.duplicates || [];
        state.chatHistory.push({
          sender: 'ai',
          text: action.payload.ai_response || 'Successfully auto-extracted fields from text log.',
          timestamp: new Date().toLocaleTimeString()
        });
      })
      .addCase(extractFieldsFromText.rejected, (state) => {
        state.isExtracting = false;
      })
      .addCase(uploadAndExtractFile.pending, (state) => {
        state.isExtracting = true;
      })
      .addCase(uploadAndExtractFile.fulfilled, (state, action) => {
        state.isExtracting = false;
        if (action.payload.form_data) {
          state.activeForm = { ...state.activeForm, ...action.payload.form_data };
          state.highlightedFields = Object.keys(action.payload.form_data);
        }
        if (action.payload.raw_text) {
          state.rawLogText = action.payload.raw_text;
        }
        state.completeness = action.payload.completeness || state.completeness;
        state.riskAnalysis = action.payload.risk_analysis || state.riskAnalysis;
        state.rcaCapa = action.payload.rca_capa || state.rcaCapa;
        state.duplicates = action.payload.duplicates || [];
      })
      .addCase(uploadAndExtractFile.rejected, (state) => {
        state.isExtracting = false;
      })
      .addCase(sendNLChatMessage.pending, (state, action) => {
        const userMsg = action.meta.arg.message;
        state.chatHistory.push({
          sender: 'user',
          text: userMsg,
          timestamp: new Date().toLocaleTimeString()
        });
      })
      .addCase(sendNLChatMessage.fulfilled, (state, action) => {
        if (action.payload.form_data) {
          state.activeForm = { ...state.activeForm, ...action.payload.form_data };
        }
        if (action.payload.changed_fields && action.payload.changed_fields.length > 0) {
          state.highlightedFields = action.payload.changed_fields;
        }
        state.completeness = action.payload.completeness || state.completeness;
        state.riskAnalysis = action.payload.risk_analysis || state.riskAnalysis;
        state.rcaCapa = action.payload.rca_capa || state.rcaCapa;
        state.duplicates = action.payload.duplicates || [];

        state.chatHistory.push({
          sender: 'ai',
          text: action.payload.ai_response || 'Updated form fields as requested.',
          changedFields: action.payload.changed_fields || [],
          timestamp: new Date().toLocaleTimeString()
        });
      })
      .addCase(runFullQMSAnalysis.pending, (state) => {
        state.isAnalyzing = true;
      })
      .addCase(runFullQMSAnalysis.fulfilled, (state, action) => {
        state.isAnalyzing = false;
        state.completeness = action.payload.completeness || state.completeness;
        state.riskAnalysis = action.payload.risk_analysis || state.riskAnalysis;
        state.rcaCapa = action.payload.rca_capa || state.rcaCapa;
        state.duplicates = action.payload.duplicates || [];
      })
      .addCase(runFullQMSAnalysis.rejected, (state) => {
        state.isAnalyzing = false;
      })
      .addCase(saveComplaintToDb.pending, (state) => {
        state.isSaving = true;
      })
      .addCase(saveComplaintToDb.fulfilled, (state, action) => {
        state.isSaving = false;
        state.savedComplaints.unshift(action.payload);
        state.statusMessage = `Complaint ${action.payload.complaint_number} registered in QMS database successfully!`;
      })
      .addCase(saveComplaintToDb.rejected, (state) => {
        state.isSaving = false;
      });
  }
});

export const {
  updateFormField,
  setFullForm,
  resetForm,
  setGroqApiKey,
  setActiveTab,
  toggleChatDrawer,
  clearHighlightedFields,
  setRawLogText
} = complaintSlice.actions;

export default complaintSlice.reducer;
