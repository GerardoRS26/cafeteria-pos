export function isRedirectError(error) {
	return error && typeof error === 'object' && 'status' in error && 'location' in error;
}
