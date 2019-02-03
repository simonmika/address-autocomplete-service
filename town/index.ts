import * as azure from "@azure/functions"
import { default as fetch } from "node-fetch"
import * as model from "../model"

export default async function(context: azure.Context, req: azure.HttpRequest) {
	if (context.bindingData.town) {
		let input = context.bindingData.town
		if (req.query.country)
			input += `, ${req.query.country}`
		const response = await fetch(`https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${input}&types=(cities)&language=sv&key=${process.env.GooglePlacesApiKey}`)
		context.res = {
			status: response.status,
			body: (await response.json() as model.GooglePlaces.PredictionResponse).predictions.map(prediction =>
				prediction.terms.length == 2 ? { town: prediction.terms[0].value, country: prediction.terms[1].value } :
				prediction.terms.length == 3 ? { town: prediction.terms[0].value, state: prediction.terms[1].value, country: prediction.terms[2].value } :
				{ street: prediction.description }),
		}
	}
	else {
		context.res = {
			status: 400,
			body: "Please pass a name on the query string or in the request body",
		}
	}
}
