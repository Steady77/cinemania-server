export const PORT = process.env.PORT || 5000;

export const CORS_OPTIONS = {
	origin: process.env.URL || '*',
	credentials: true,
};

export const FILE_OPTIONS = {
	limits: {
		fileSize: 10 * 1024 * 1024,
		files: 1,
	},
};

export const SOCKET_OPTIONS = {
	cors: {
		origin: process.env.URL,
		credentials: true,
	},
};
