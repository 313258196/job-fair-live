

export const msgBundle = ({message,userID}) => {
	return {
		...message,
		text: message.payload.text,
		self: message.from == userID,
	}
}