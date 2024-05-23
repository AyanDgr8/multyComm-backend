// src/services/kycService.js 


import axios from 'axios';

const BASE_URL_V1 = 'https://svc.digitap.ai/validation/kyc/v1/pan_basic';
const BASE_URL_V2 = 'https://svc.digitap.ai/validation/kyc/v2/pan_basic';

const getAuthHeader = (clientId, clientSecret) => {
    const token = btoa(`${clientId}:${clientSecret}`);
    return `Basic ${token}`;
};

export const validatePanV1 = async (clientRefNum, pan, name = '', nameMatchMethod = 'fuzzy') => {
    const clientId = process.env.KYC_CLIENT_ID;
    const clientSecret = process.env.KYC_CLIENT_SECRET;

    const headers = {
        'Content-Type': 'application/json',
        'Authorization': getAuthHeader(clientId, clientSecret)
    };

    const data = {
        client_ref_num: clientRefNum,
        pan: pan,
        name: name,
        name_match_method: nameMatchMethod
    };

    try {
        const response = await axios.post(BASE_URL_V1, data, { headers });
        return response.data;
    } catch (error) {
        console.error('Error validating PAN V1:', error.response.data);
        throw error.response.data;
    }
};

export const validatePanV2 = async (clientRefNum, pan, name, dob) => {
    const clientId = process.env.KYC_CLIENT_ID;
    const clientSecret = process.env.KYC_CLIENT_SECRET;

    const headers = {
        'Content-Type': 'application/json',
        'Authorization': getAuthHeader(clientId, clientSecret)
    };

    const data = {
        client_ref_num: clientRefNum,
        pan: pan,
        name: name,
        dob: dob
    };

    try {
        const response = await axios.post(BASE_URL_V2, data, { headers });
        return response.data;
    } catch (error) {
        console.error('Error validating PAN V2:', error.response.data);
        throw error.response.data;
    }
};
