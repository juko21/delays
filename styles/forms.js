import {Dimensions} from 'react-native';

export const sidebyButtonSearch = {
    flex: 0,
    top: 0,
    left: 0,
    flexWrap: "nowrap",
    flexDirection: "row",
    height: 70,
    gap: 5,
    width: "100%",
    padding: 10,
    backgroundColor: "#ccc",
    zIndex: 10,
    borderBottomRadius: 5
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

export const inputWrapper = {
    flex: 1,
    flexWrap: "nowrap",
    flexDirection: "row",
    width: "100%",
    padding: 10,
    height: 50,
    backgroundColor: "#fff",
    zIndex: 10,
    borderRadius: 5
}

export const wrappedInput = {
    fontSize: 20,
    height: "100%",
    flexGrow: 1,
    padding: "auto",
    paddingLeft: 10,
    borderColor: "#ccc",
    borderRadius: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.8)'
}


export const pressable = {
    width: 50,
    height: 50,
    marginLeft: 10,
    borderRadius: 5
}

export const pressableStar = {
    width: 30,
    height: 30,
    borderRadius: 15
}
export const pressableWide = {
    width: Dimensions.get('window').width - 20,
    height: 50,
    borderRadius: 5
}

export const buttonText = {
    color: "#fff",
    fontSize: 26,
    lineHeight: 26,
    top: 12,
    textAlign: 'center',
}

export const star = {
    fontSize: 20,
    lineHeight: 20,
    top: 5,
    color: "white",
    textAlign: 'center',
}

export const starYellow = {
    fontSize: 20,
    lineHeight: 20,
    top: 5,
    color: "yellow",
    textAlign: 'center',
}

export const dropdown = {
    position: "absolute",
    top: 70,
    width: Dimensions.get('window').width - 20,
    maxHeight: 200,
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