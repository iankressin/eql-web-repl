export function repositionCursor(input: HTMLInputElement, newPositionOffset: number) {
	const currentPosition = input.selectionStart || 0;
	const newPosition = currentPosition + newPositionOffset;

	setTimeout(() => {
		input.focus();
		input.setSelectionRange(newPosition, newPosition);
	}, 0);
	return;
}
