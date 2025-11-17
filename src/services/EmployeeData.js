import axios from 'axios';

const apiClient = axios.create({
    baseURL: 'https://dummyapi.online/api/movies',
    timeout: 8000,
    headers: {'Authorization': 'Bearer yourtokenhere'}
});

export const EmployeeData = async () => {
    try {
        const response = await apiClient.get('/data');
        return response.data;
    } catch (error) {
        console.error('Error fetching data:', error);
        throw error;
    }
};