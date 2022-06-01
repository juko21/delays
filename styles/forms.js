import {Dimensions} from 'react-native';

export const container = {
    display: "flex",
    width: "100%",
    height: "auto",
    margin: 0,
    padding: 0,
}
export const input = {
    fontSize: 20,
    borderWidth: 1,
    height: 50,
    flexGrow: 1,
    padding: "auto",
    paddingLeft: 10,
    borderColor: "#ccc",
    borderRadius: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.8)'
}

export const authInput = {
    fontSize: 20,
    marginBottom: 28,
    borderWidth: 1,
    padding: 8,
    borderColor: "#ccc",
    borderRadius: 3
}

export const pressable = {
    width: 28,
    height: 28,
    borderRadius: 5
}

export const buttonText = {
    color: "#fff",
    fontSize: 26,
    textAlign: 'center',
}

export const dropdown = {
    position: "absolute",
    top: 120,
    width: Dimensions.get('window').width - 20,
    maxHeight: 300,
    margin: 10,
    left: 0,
    backgroundColor: "#fff",
    zIndex: 10,
    borderRadius: 10
}

export const dropdownListItem = {
    width: "100%",
    fontSize: 20,
    padding: 10,
}

