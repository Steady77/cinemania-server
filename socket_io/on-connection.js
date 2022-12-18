export const onConnection = (io, socket) => {
	console.log(`User connected ${socket.id}`);

	const { roomId } = socket.handshake.query;
	socket.roomId = roomId;
	socket.join(roomId);

	socket.on('send_message', (message) => {
		io.in(socket.roomId).emit('get_message', message);
	});

	socket.on('disconnect', (reason) => {
		console.log(`User disconnected. ${reason}`);
		socket.leave(roomId);
	});
};
