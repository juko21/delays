import { Dimensions } from 'react-native';

export const container = {
    display: "flex",
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    height: Dimensions.get('window').height - 60,
    backgroundColor: "#fff",
}
export const input = {
    fontSize: 20,
    width: "80%",
    borderBottomWidth: 2, 
    borderColor: "#ccc",
    color: "#000",
    fontFamily: "NotoSans-Regular",
    margin: 10,
}

export const pressable = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    height: 40,
    width: "80%",
    margin: 10,
    backgroundColor: "#BD3734",
    borderBottomWidth: 2, 
    borderColor: "#96302B",
}

export const pressableText = {
    fontFamily: "NotoSans-Regular",
    color: "#fff",
    fontSize: 16,
}