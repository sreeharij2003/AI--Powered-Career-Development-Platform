// Simple script to test the LinkedIn API directly
// Run with: node src/test-api.js

const API_KEY = "50e16db1b9msh3cd5b97a059ce2bp181ba5jsndd3ab1bbc0ac";
const BASE_URL = "https://linkedin-jobs-search.p.rapidapi.com";

async function testLinkedInApi() {
	console.log('Testing LinkedIn Jobs Search API...');
	
	const options = {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'X-RapidAPI-Key': API_KEY,
			'X-RapidAPI-Host': 'linkedin-jobs-search.p.rapidapi.com'
		},
		body: JSON.stringify({
			search_terms: 'software developer',
			location: 'United States',
			page: '1'
		})
	};
	
	try {
		console.log('Making request to:', `${BASE_URL}/search`);
		console.log('Request body:', options.body);
		
		const response = await fetch(`${BASE_URL}/search`, options);
		console.log('Response status:', response.status, response.statusText);
		
		if (!response.ok) {
			const errorText = await response.text();
			console.error('API error response:', errorText);
			throw new Error(`API error: ${response.status} ${response.statusText}`);
		}
		
		const data = await response.json();
		
		console.log('API response type:', typeof data);
		console.log('API response is array:', Array.isArray(data));
		
		if (Array.isArray(data) && data.length > 0) {
			console.log('Number of jobs returned:', data.length);
			console.log('First job keys:', Object.keys(data[0]));
			console.log('First job example:', JSON.stringify(data[0], null, 2));
		} else {
			console.log('API returned empty or non-array response:', data);
		}
		
		console.log('Test completed successfully');
	} catch (error) {
		console.error('Error testing API:', error);
	}
}

// Run the test
testLinkedInApi(); 