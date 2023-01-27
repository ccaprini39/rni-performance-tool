'use client'

import { Button, Modal } from "@mui/material"
import { Box } from "@mui/system"
import { useState } from "react"

export default function ModalWrapper({ children }) {

    const [open, setOpen] = useState(true)
    const handleOpen = () => setOpen(true)
    const handleClose = () => setOpen(false)

    const style = {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        height : '85%',
        width: '85%',
        bgcolor: 'grey.100',
        border: '2px solid #000',
        borderRadius: 15,
        boxShadow: 24,
        p: 4
    }

    return (
        <div>
            <Button onClick={handleOpen}>Open Results</Button>
            <Modal
                open={open}
                onClose={handleClose}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
            >
                <Box style={{backgroundColor: 'white'}} sx={style}>
                    {children}
                </Box>
            </Modal>
        </div>
    )
}