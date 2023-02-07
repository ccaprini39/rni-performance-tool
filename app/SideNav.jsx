'use client'
import { Box, ListItem, ListItemButton, MenuList } from "@mui/material"
import Link from "next/link"
import WindowFeatureIcon, { ApiIcon, ElasticIcon } from "../components/icons/NavIcons"

export default function SideNav(){
    return (
        <Box>
            <MenuList>
                <NavItem 
                    link="/elastic-instances" 
                    text="Elastic Instances" 
                />
                <NavItem
                    link="/api-doc"
                    text="API Docs"
                />
                <NavItem
                    link="/window-feature"
                    text="Window Tool"
                />
            </MenuList>
        </Box>
    )
}

function NavItem({link, text}){
    return (
        <ListItem>
            <Link href={link}>
                <ListItemButton style={navItem}>
                    <IconComponent text={text} />
                    {text}
                </ListItemButton>
            </Link>
        </ListItem>
    )
}

function IconComponent({text}){
    if (text === "Elastic Instances") return <ElasticIcon />
    if (text === "API Docs") return <ApiIcon />
    if (text === "Window Tool") return <WindowFeatureIcon />
    else return <></>
}

const navItem = {
    width: '100%',
    padding: '0',
    display: 'flex',
    textAlign: 'center',
    flexDirection: 'column',
}