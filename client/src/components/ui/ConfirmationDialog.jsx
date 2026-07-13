import React from 'react';
import Modal from './Modal';
import PrimaryButton from './PrimaryButton';
import SecondaryButton from './SecondaryButton';

const ConfirmationDialog = ({ isOpen, onClose, onConfirm, title = 'Confirm Action', message, confirmText = 'Confirm' }) => {
    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title}>
            <div className="space-y-6">
                <p className="font-sans text-sm text-abyss-muted leading-relaxed">{message}</p>
                <div className="flex justify-end space-x-3 pt-2">
                    <SecondaryButton onClick={onClose}>
                        Cancel
                    </SecondaryButton>
                    <PrimaryButton
                        onClick={() => {
                            onConfirm();
                            onClose();
                        }}
                        className="bg-abyss-danger hover:bg-abyss-danger/90 shadow-glow-danger"
                    >
                        {confirmText}
                    </PrimaryButton>
                </div>
            </div>
        </Modal>
    );
};

export default ConfirmationDialog;
