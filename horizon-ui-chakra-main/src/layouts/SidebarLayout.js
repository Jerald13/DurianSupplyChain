import { routes } from "../routes"

// ...

export default function SidebarLayout({ children }) {
    // ...

    return (
        // ...
        <List>
            {routes.map((route) => (
                <ListItem key={route.path} to={route.path} as={NavLink} activeClassName="active">
                    <ListIcon as={route.icon} />
                    <ListItemText>{route.name}</ListItemText>
                </ListItem>
            ))}
            <ListItem to="/my-page" as={NavLink} activeClassName="active">
                <ListIcon as={BsFileEarmark} />
                <ListItemText>My Page</ListItemText>
            </ListItem>
        </List>
        // ...
    )
}
