import React, { useState } from 'react';
import { Button, Card, Modal } from 'react-bootstrap';

interface StaticBackdropModalProps {
    title: string;
    bodyText: string;
    closeButtonLabel: string;
    confirmButtonLabel: string;
    onClose: () => void;
    onConfirm: () => void;
    isOpen: boolean;
    toggleModal: () => void;
}

const StaticBackdropModal: React.FC<StaticBackdropModalProps> = ({
                                                                     title,
                                                                     bodyText,
                                                                     closeButtonLabel,
                                                                     confirmButtonLabel,
                                                                     onClose,
                                                                     onConfirm,
                                                                     isOpen,
                                                                     toggleModal
                                                                 }) => {
    return (

                <Modal show={isOpen} onHide={toggleModal} backdrop="static" keyboard={false}>
                    <Modal.Header closeButton>
                        <Modal.Title>{title}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>{bodyText}</Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={onClose}>
                            {closeButtonLabel}
                        </Button>
                        <Button variant="primary" onClick={() => { onConfirm(); toggleModal(); }}>
                            {confirmButtonLabel}
                        </Button>
                    </Modal.Footer>
                </Modal>
    );
};

export default StaticBackdropModal;
